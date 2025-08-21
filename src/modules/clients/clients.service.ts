import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaService } from '../prisma/prisma.service';
import {
  ClientResponseDto,
  ClientListResponseDto,
  ClientStatsDto,
} from './dto/client-response.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createClientDto: CreateClientDto,
  ): Promise<{ message: string; client: ClientResponseDto }> {
    const { businessId, dni, name, email, phone, address } = createClientDto;

    // Verificar que el negocio existe
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    // Verificar DNI único si se proporciona
    if (dni) {
      const existingDni = await this.prisma.client.findFirst({
        where: {
          dni,
          businessId,
        },
      });

      if (existingDni) {
        throw new ConflictException('Ya existe un cliente con este DNI en este negocio');
      }
    }

    // Verificar email único en el negocio si se proporciona
    if (email) {
      const existingEmail = await this.prisma.client.findFirst({
        where: {
          email,
          businessId,
        },
      });

      if (existingEmail) {
        throw new ConflictException('Ya existe un cliente con este email en este negocio');
      }
    }

    try {
      const client = await this.prisma.client.create({
        data: {
          dni,
          name,
          email,
          phone,
          address,
          businessId,
        },
      });

      return {
        message: 'Cliente creado exitosamente',
        client: this.formatClientResponse(client),
      };
    } catch (error) {
      throw new BadRequestException('Error al crear el cliente');
    }
  }

  async findAllByBusiness(
    businessId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    dni?: string,
  ): Promise<ClientListResponseDto> {
    // Verificar que el negocio existe
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    const skip = (page - 1) * limit;

    // Construir filtros de búsqueda
    const where: any = {
      businessId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (dni) {
      where.dni = { contains: dni };
    }

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: { sales: true },
          },
          sales: {
            select: {
              total: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      clients: clients.map((client) => this.formatClientResponse(client)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string, businessId: string): Promise<ClientResponseDto> {
    const client = await this.prisma.client.findFirst({
      where: {
        id,
        businessId,
      },
      include: {
        _count: {
          select: { sales: true },
        },
        sales: {
          select: {
            total: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5, // Últimas 5 ventas
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return this.formatClientResponse(client);
  }

  async update(
    id: string,
    businessId: string,
    updateClientDto: UpdateClientDto,
  ): Promise<{ message: string; client: ClientResponseDto }> {
    const { dni, name, email, phone, address } = updateClientDto;

    // Verificar que el cliente existe
    const existingClient = await this.prisma.client.findFirst({
      where: {
        id,
        businessId,
      },
    });

    if (!existingClient) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // Verificar DNI único si se está actualizando
    if (dni && dni !== existingClient.dni) {
      const existingDni = await this.prisma.client.findFirst({
        where: {
          dni,
          businessId,
          id: { not: id },
        },
      });

      if (existingDni) {
        throw new ConflictException('Ya existe un cliente con este DNI en este negocio');
      }
    }

    // Verificar email único si se está actualizando
    if (email && email !== existingClient.email) {
      const existingEmail = await this.prisma.client.findFirst({
        where: {
          email,
          businessId,
          id: { not: id },
        },
      });

      if (existingEmail) {
        throw new ConflictException('Ya existe un cliente con este email en este negocio');
      }
    }

    try {
      const updatedClient = await this.prisma.client.update({
        where: { id },
        data: {
          dni,
          name,
          email,
          phone,
          address,
        },
        include: {
          _count: {
            select: { sales: true },
          },
          sales: {
            select: {
              total: true,
            },
          },
        },
      });

      return {
        message: 'Cliente actualizado exitosamente',
        client: this.formatClientResponse(updatedClient),
      };
    } catch (error) {
      throw new BadRequestException('Error al actualizar el cliente');
    }
  }

  async remove(id: string, businessId: string): Promise<{ message: string }> {
    // Verificar que el cliente existe
    const client = await this.prisma.client.findFirst({
      where: {
        id,
        businessId,
      },
      include: {
        _count: {
          select: { sales: true },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // Verificar si el cliente tiene ventas asociadas
    if (client._count.sales > 0) {
      throw new BadRequestException(
        'No se puede eliminar un cliente que tiene ventas asociadas',
      );
    }

    try {
      await this.prisma.client.delete({
        where: { id },
      });

      return {
        message: 'Cliente eliminado exitosamente',
      };
    } catch (error) {
      throw new BadRequestException('Error al eliminar el cliente');
    }
  }

  async getClientStats(id: string, businessId: string): Promise<ClientStatsDto> {
    const client = await this.prisma.client.findFirst({
      where: {
        id,
        businessId,
      },
      include: {
        sales: {
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
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    const totalSales = client.sales.length;
    const totalAmount = client.sales.reduce((sum, sale) => sum + sale.total, 0);
    const averageOrderValue = totalSales > 0 ? totalAmount / totalSales : 0;

    const salesDates = client.sales.map(sale => sale.createdAt).sort();
    const firstPurchaseDate = salesDates.length > 0 ? salesDates[0] : undefined;
    const lastPurchaseDate = salesDates.length > 0 ? salesDates[salesDates.length - 1] : undefined;

    // Calcular productos favoritos
    const productCounts = new Map<string, { name: string; count: number }>();
    
    client.sales.forEach(sale => {
      sale.items.forEach(item => {
        const productId = item.product.id;
        const productName = item.product.name;
        
        if (productCounts.has(productId)) {
          productCounts.get(productId)!.count += item.quantity;
        } else {
          productCounts.set(productId, { name: productName, count: item.quantity });
        }
      });
    });

    const favoriteProducts = Array.from(productCounts.entries())
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        purchaseCount: data.count,
      }))
      .sort((a, b) => b.purchaseCount - a.purchaseCount)
      .slice(0, 5); // Top 5 productos

    return {
      totalSales,
      totalAmount,
      averageOrderValue,
      firstPurchaseDate,
      lastPurchaseDate,
      favoriteProducts,
    };
  }

  async findByDni(dni: string, businessId: string): Promise<ClientResponseDto | null> {
    const client = await this.prisma.client.findFirst({
      where: {
        dni,
        businessId,
      },
      include: {
        _count: {
          select: { sales: true },
        },
        sales: {
          select: {
            total: true,
          },
        },
      },
    });

    return client ? this.formatClientResponse(client) : null;
  }

  async getTopCustomers(businessId: string, limit: number = 10): Promise<ClientResponseDto[]> {
    const clients = await this.prisma.client.findMany({
      where: { businessId },
      include: {
        _count: {
          select: { sales: true },
        },
        sales: {
          select: {
            total: true,
          },
        },
      },
    });

    // Calcular total de compras por cliente y ordenar
    const clientsWithTotals = clients
      .map(client => ({
        ...client,
        totalPurchases: client.sales.reduce((sum, sale) => sum + sale.total, 0),
      }))
      .sort((a, b) => b.totalPurchases - a.totalPurchases)
      .slice(0, limit);

    return clientsWithTotals.map(client => this.formatClientResponse(client));
  }

  private formatClientResponse(client: any): ClientResponseDto {
    const totalPurchases = client.sales ? 
      client.sales.reduce((sum: number, sale: any) => sum + sale.total, 0) : 0;
    
    return {
      id: client.id,
      dni: client.dni,
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      businessId: client.businessId,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      salesCount: client._count?.sales || 0,
      totalPurchases,
    };
  }
}
