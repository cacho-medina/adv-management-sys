import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSaleDto: CreateSaleDto) {
    const { businessId, clientId, items, clientData } = createSaleDto;

    // 1. Verificar stock de productos
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

    // 2. Calcular total de la venta
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // 3. Manejar cliente (buscar por DNI o crear nuevo)
    let finalClientId = clientId;

    if (clientData?.dni) {
      // Buscar cliente existente por DNI
      let existingClient = await this.prisma.client.findFirst({
        where: {
          businessId,
          dni: clientData.dni,
        },
      });

      if (!existingClient && clientData.name) {
        // Crear nuevo cliente si se proporcionan datos
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

    // 4. Usar transacción para garantizar consistencia
    const result = await this.prisma.$transaction(async (tx) => {
      // Crear la venta
      const sale = await tx.sale.create({
        data: {
          businessId,
          clientId: finalClientId,
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

      // Actualizar stock de productos
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
        sale,
        saleItems,
      };
    });

    return {
      message: 'Venta registrada exitosamente',
      sale: result.sale,
      items: result.saleItems,
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

  update(id: number, updateSaleDto: UpdateSaleDto) {
    return `This action updates a #${id} sale`;
  }

  remove(id: number) {
    return `This action removes a #${id} sale`;
  }
}
