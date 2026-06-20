import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSaleDto: CreateSaleDto) {
    const {
      businessId,
      clientId,
      items,
      clientData,
      discountType,
      discountValue,
      discounts,
      payments,
      couponCode,
    } = createSaleDto;

    // 1. Verificar stock de productos (mantener lógica existente)
    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
        select: { name: true, stock: true },
      });

      if (!product) {
        throw new BadRequestException(
          `Producto con ID ${item.productId} no encontrado`,
        );
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para el producto "${product.name}". Stock disponible: ${product.stock}, cantidad solicitada: ${item.quantity}`,
        );
      }
    }

    // 2. Calcular subtotal (sin descuentos)
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // 3. Calcular descuentos y total final
    let totalDiscountAmount = 0;

    // Descuento simple
    if (discountType && discountValue) {
      if (discountType === 'PERCENTAGE') {
        totalDiscountAmount = (subtotal * discountValue) / 100;
      } else if (discountType === 'FIXED_AMOUNT') {
        totalDiscountAmount = discountValue;
      }
    }

    // Descuentos múltiples
    if (discounts && discounts.length > 0) {
      totalDiscountAmount = discounts.reduce((sum, discount) => {
        if (discount.type === 'PERCENTAGE') {
          return sum + (subtotal * discount.value) / 100;
        } else if (discount.type === 'FIXED_AMOUNT') {
          return sum + discount.value;
        }
        return sum;
      }, totalDiscountAmount);
    }

    const total = Math.max(0, subtotal - totalDiscountAmount);

    // 4. Manejar cliente (mantener lógica existente)
    let finalClientId = clientId;
    if (clientData?.dni) {
      let existingClient = await this.prisma.client.findFirst({
        where: { businessId, dni: clientData.dni },
      });

      if (!existingClient && clientData.name) {
        existingClient = await this.prisma.client.create({
          data: {
            businessId,
            name: clientData.name,
            email: clientData.email,
            phone: clientData.phone,
            address: clientData.address,
            dni: clientData.dni,
          },
        });
      }
      finalClientId = existingClient?.id;
    }

    // 5. Usar transacción para garantizar consistencia
    const result = await this.prisma.$transaction(async (tx) => {
      // Crear la venta con nuevos campos
      const sale = await tx.sale.create({
        data: {
          businessId,
          clientId: finalClientId,
          subtotal,
          discountType,
          discountValue: totalDiscountAmount,
          total,
          status: 'PENDING',
        },
      });

      // Crear los items de venta
      const saleItems = await Promise.all(
        items.map((item) =>
          tx.saleItem.create({
            data: {
              saleId: sale.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            },
          }),
        ),
      );

      // Crear descuentos detallados si existen
      let saleDiscounts = [];
      if (discounts && discounts.length > 0) {
        saleDiscounts = await Promise.all(
          discounts.map((discount) =>
            tx.saleDiscount.create({
              data: {
                saleId: sale.id,
                businessId,
                type: discount.type,
                value: discount.value,
                description: discount.description,
                couponCode: discount.couponCode,
              },
            }),
          ),
        );
      } else if (discountType && discountValue) {
        // Crear descuento simple
        const saleDiscount = await tx.saleDiscount.create({
          data: {
            saleId: sale.id,
            businessId,
            type: discountType,
            value: discountValue,
            couponCode,
          },
        });
        saleDiscounts = [saleDiscount];
      }

      // Crear pagos si se proporcionan
      let salePayments = [];
      if (payments && payments.length > 0) {
        salePayments = await Promise.all(
          payments.map((payment) =>
            tx.payment.create({
              data: {
                saleId: sale.id,
                businessId,
                amount: payment.amount,
                method: payment.method,
                reference: payment.reference,
                notes: payment.notes,
                status: 'COMPLETED',
                paidAt: new Date(),
              },
            }),
          ),
        );

        // Verificar si la venta está completamente pagada
        const totalPaid = payments.reduce(
          (sum, payment) => sum + payment.amount,
          0,
        );
        if (totalPaid >= total) {
          await tx.sale.update({
            where: { id: sale.id },
            data: { status: 'COMPLETED' },
          });
        }
      }

      // Actualizar stock de productos
      await Promise.all(
        items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          }),
        ),
      );

      return {
        sale,
        saleItems,
        saleDiscounts,
        salePayments,
      };
    });

    return {
      message: 'Venta registrada exitosamente',
      sale: result.sale,
      items: result.saleItems,
      discounts: result.saleDiscounts,
      payments: result.salePayments,
    };
  }

  async findSales(filters: {
    businessId: string;
    clientId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      businessId,
      clientId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = filters;

    const where: any = {};

    // Filtro por negocio (obligatorio para seguridad)
    if (businessId) {
      where.businessId = businessId;
    }

    // Filtro por cliente (opcional)
    if (clientId) {
      where.clientId = clientId;
    }

    // Filtro por estado (opcional)
    if (status) {
      where.status = status;
    }

    // Filtro por rango de fechas (opcional)
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [sales, total] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              dni: true,
              email: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
            },
          },
          discounts: true, // Incluir descuentos
          payments: {
            // Incluir pagos
            select: {
              id: true,
              amount: true,
              method: true,
              status: true,
              paidAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.sale.count({ where }),
    ]);

    return {
      sales,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(businessId: string, id: string) {
    const sale = await this.prisma.sale.findFirst({
      where: {
        id,
        businessId, // Asegurar que la venta pertenece al negocio
      },
      include: {
        client: {
          select: {
            id: true,
            dni: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                description: true,
                sku: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        business: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!sale) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    // Calcular información adicional
    const itemsCount = sale.items.length;
    const totalQuantity = sale.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    return {
      ...sale,
      summary: {
        itemsCount,
        totalQuantity,
        averageItemPrice: sale.total / totalQuantity,
      },
    };
  }

  async update(businessId: string, id: string, updateSaleDto: UpdateSaleDto) {
    const { clientId, items, clientData, status } = updateSaleDto;

    // 1. Verificar que la venta existe y pertenece al negocio
    const existingSale = await this.prisma.sale.findFirst({
      where: {
        id,
        businessId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                stock: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!existingSale) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    // 2. No permitir modificar ventas ya procesadas (refunded/cancelled)
    if (
      existingSale.status === 'REFUNDED' ||
      existingSale.status === 'CANCELLED'
    ) {
      throw new BadRequestException(
        `No se puede modificar una venta con estado ${existingSale.status}`,
      );
    }

    // 3. Si solo se cambia el estado (sin modificar items), usar update simple
    if (!items || items.length === 0) {
      const updatedSale = await this.prisma.sale.update({
        where: { id },
        data: {
          status: status || existingSale.status,
          clientId: clientId !== undefined ? clientId : existingSale.clientId,
        },
      });

      return {
        message: 'Estado de venta actualizado exitosamente',
        sale: updatedSale,
        items: existingSale.items,
        isNewSale: false,
      };
    }

    // 4. Manejar cliente (similar al método create)
    let finalClientId =
      clientId !== undefined ? clientId : existingSale.clientId;

    if (clientData?.dni) {
      let existingClient = await this.prisma.client.findFirst({
        where: {
          businessId,
          dni: clientData.dni,
        },
      });

      if (!existingClient && clientData.name) {
        existingClient = await this.prisma.client.create({
          data: {
            businessId,
            name: clientData.name,
            email: clientData.email,
            phone: clientData.phone,
            address: clientData.address,
            dni: clientData.dni,
          },
        });
      }

      finalClientId = existingClient?.id;
    }

    // 5. Verificar stock para nuevos items
    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
        select: { name: true, stock: true },
      });

      if (!product) {
        throw new BadRequestException(
          `Producto con ID ${item.productId} no encontrado`,
        );
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para el producto "${product.name}". Stock disponible: ${product.stock}, cantidad solicitada: ${item.quantity}`,
        );
      }
    }

    // 6. Calcular total de la nueva venta
    const newTotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // 7. ESTRATEGIA: Marcar venta original como refunded/cancelled y crear nueva
    const result = await this.prisma.$transaction(async (tx) => {
      // Paso 1: Restaurar stock de la venta original
      await Promise.all(
        existingSale.items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          }),
        ),
      );

      // Paso 2: Marcar venta original según su estado
      const originalSaleNewStatus =
        existingSale.status === 'COMPLETED' ? 'REFUNDED' : 'CANCELLED';

      const markedOriginalSale = await tx.sale.update({
        where: { id },
        data: {
          status: originalSaleNewStatus,
        },
      });

      // Paso 3: Eliminar SaleItems de la venta original
      await tx.saleItem.deleteMany({
        where: { saleId: id },
      });

      // Paso 4: Crear nueva venta
      const newSale = await tx.sale.create({
        data: {
          businessId,
          clientId: finalClientId,
          subtotal: newTotal,
          total: newTotal, // Campo faltante - inicialmente igual al subtotal
          status: 'PENDING',
        },
      });

      // Paso 5: Crear nuevos SaleItems
      const newSaleItems = await Promise.all(
        items.map((item) =>
          tx.saleItem.create({
            data: {
              saleId: newSale.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            },
          }),
        ),
      );

      // Paso 6: Actualizar stock con nuevos items
      await Promise.all(
        items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          }),
        ),
      );

      return {
        originalSale: markedOriginalSale,
        newSale,
        newSaleItems,
      };
    });

    return {
      message: `Venta original marcada como ${result.originalSale.status.toLowerCase()}. Nueva venta creada exitosamente.`,
      originalSale: {
        id: result.originalSale.id,
        status: result.originalSale.status,
        total: result.originalSale.total,
      },
      sale: result.newSale,
      items: result.newSaleItems,
      isNewSale: true,
    };
  }

  async remove(businessId: string, id: string) {
    // 1. Verificar que la venta existe y pertenece al negocio
    const existingSale = await this.prisma.sale.findFirst({
      where: {
        id,
        businessId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!existingSale) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    // 2. Verificar si la venta ya está cancelada
    if (existingSale.status === 'CANCELLED') {
      throw new BadRequestException('La venta ya está cancelada');
    }

    // 3. Si la venta está reembolsada, no permitir eliminación
    if (existingSale.status === 'REFUNDED') {
      throw new BadRequestException(
        'No se puede eliminar una venta reembolsada',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Restaurar stock de todos los items
      await Promise.all(
        existingSale.items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          }),
        ),
      );

      if (existingSale.status === 'COMPLETED') {
        // ESTRATEGIA 1: Cancelar venta completada (soft delete)
        const cancelledSale = await tx.sale.update({
          where: { id },
          data: {
            status: 'CANCELLED',
          },
        });

        // Eliminar los SaleItems para limpiar la relación
        await tx.saleItem.deleteMany({
          where: { saleId: id },
        });

        return {
          action: 'cancelled',
          sale: cancelledSale,
          message: 'Venta completada cancelada exitosamente. Stock restaurado.',
        };
      } else {
        // ESTRATEGIA 2: Eliminar físicamente venta pendiente (hard delete)
        // Primero eliminar los items
        await tx.saleItem.deleteMany({
          where: { saleId: id },
        });

        // Luego eliminar la venta
        await tx.sale.delete({
          where: { id },
        });

        return {
          action: 'deleted',
          sale: null,
          message: 'Venta pendiente eliminada exitosamente. Stock restaurado.',
        };
      }
    });

    return result;
  }
  // Método para agregar pagos
  async addPayment(
    businessId: string,
    saleId: string,
    paymentData: CreatePaymentDto,
  ) {
    const sale = await this.prisma.sale.findFirst({
      where: { id: saleId, businessId },
      include: { payments: true },
    });

    if (!sale) {
      throw new NotFoundException(`Venta con ID ${saleId} no encontrada`);
    }

    const totalPaid = sale.payments.reduce(
      (sum, payment) =>
        payment.status === 'COMPLETED' ? sum + payment.amount : sum,
      0,
    );
    const pendingAmount = sale.total - totalPaid;

    if (paymentData.amount > pendingAmount) {
      throw new BadRequestException(
        `El monto del pago (${paymentData.amount}) excede el monto pendiente (${pendingAmount})`,
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          saleId,
          businessId,
          amount: paymentData.amount,
          method: paymentData.method,
          reference: paymentData.reference,
          notes: paymentData.notes,
          status: 'COMPLETED',
          paidAt: new Date(),
        },
      });

      const newTotalPaid = totalPaid + paymentData.amount;
      if (newTotalPaid >= sale.total) {
        await tx.sale.update({
          where: { id: saleId },
          data: { status: 'COMPLETED' },
        });
      }

      return payment;
    });

    return {
      message: 'Pago registrado exitosamente',
      payment: result,
    };
  }

  // Método para obtener pagos de una venta
  async getSalePayments(businessId: string, saleId: string) {
    const payments = await this.prisma.payment.findMany({
      where: {
        saleId,
        businessId,
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalPaid = payments.reduce(
      (sum, payment) =>
        payment.status === 'COMPLETED' ? sum + payment.amount : sum,
      0,
    );

    return {
      payments,
      summary: {
        totalPaid,
        paymentsCount: payments.length,
      },
    };
  }

  // Método para aplicar descuentos
  async applyDiscount(businessId: string, saleId: string, discountData: any) {
    const sale = await this.prisma.sale.findFirst({
      where: { id: saleId, businessId },
      include: { discounts: true },
    });

    if (!sale) {
      throw new NotFoundException(`Venta con ID ${saleId} no encontrada`);
    }

    if (sale.status !== 'PENDING') {
      throw new BadRequestException(
        'Solo se pueden aplicar descuentos a ventas pendientes',
      );
    }

    let discountAmount = 0;
    if (discountData.type === 'PERCENTAGE') {
      discountAmount = (sale.subtotal * discountData.value) / 100;
    } else if (discountData.type === 'FIXED_AMOUNT') {
      discountAmount = discountData.value;
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const discount = await tx.saleDiscount.create({
        data: {
          saleId,
          businessId,
          type: discountData.type,
          value: discountData.value,
          description: discountData.description,
          couponCode: discountData.couponCode,
        },
      });

      const currentTotalDiscount = sale.discountValue || 0;
      const newTotalDiscount = currentTotalDiscount + discountAmount;
      const newTotal = Math.max(0, sale.subtotal - newTotalDiscount);

      const updatedSale = await tx.sale.update({
        where: { id: saleId },
        data: {
          discountValue: newTotalDiscount,
          total: newTotal,
        },
      });

      return { discount, updatedSale };
    });

    return {
      message: 'Descuento aplicado exitosamente',
      discount: result.discount,
      sale: result.updatedSale,
    };
  }
}
