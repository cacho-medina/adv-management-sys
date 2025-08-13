import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateBusinessDto,
  UpdateBusinessDto,
  InviteEmployeeDto,
  BusinessSettingsDto,
  BusinessResponseDto,
  BusinessListResponseDto,
  BusinessStatsDto,
  EmployeeResponseDto,
} from './dto/business.dto';
import { Role } from '@prisma/client';

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  async createBusiness(userId: string, createBusinessDto: CreateBusinessDto) {
    const { name, description, address, phone, email, website, logo } =
      createBusinessDto;

    if (!userId) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const business = await this.prisma.business.create({
      data: {
        name,
        description,
        address,
        phone,
        email,
        website,
        logo,
      },
    });

    await this.prisma.userBusiness.create({
      data: {
        userId,
        businessId: business.id,
        role: Role.OWNER,
      },
    });

    return {
      message: 'Negocio creado correctamente',
      business: this.formatBusinessResponse(business, Role.OWNER),
    };
  }

  async findAllByUser(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<BusinessListResponseDto> {
    const skip = (page - 1) * limit;
    console.log(userId);
    const [userBusinesses, total] = await Promise.all([
      this.prisma.userBusiness.findMany({
        where: { userId },
        include: {
          business: {
            include: {
              _count: {
                select: {
                  userBusinesses: true,
                  products: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { joinedAt: 'desc' },
      }),
      this.prisma.userBusiness.count({
        where: { userId },
      }),
    ]);

    const businesses = userBusinesses.map((ub) =>
      this.formatBusinessResponse(
        ub.business,
        ub.role,
        ub.business._count.userBusinesses,
      ),
    );

    return {
      businesses,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(
    businessId: string,
    userId: string,
  ): Promise<BusinessResponseDto> {
    const userBusiness = await this.prisma.userBusiness.findUnique({
      where: {
        userId_businessId: {
          userId,
          businessId,
        },
      },
      include: {
        business: {
          include: {
            _count: {
              select: {
                userBusinesses: true,
                products: true,
              },
            },
          },
        },
      },
    });

    if (!userBusiness) {
      throw new NotFoundException('Negocio no encontrado o sin acceso');
    }

    return this.formatBusinessResponse(
      userBusiness.business,
      userBusiness.role,
      userBusiness.business._count.userBusinesses,
    );
  }

  async update(
    businessId: string,
    userId: string,
    updateBusinessDto: UpdateBusinessDto,
  ): Promise<{ message: string; business: BusinessResponseDto }> {
    // Verificar permisos
    const userBusiness = await this.checkUserPermissions(businessId, userId, [
      Role.OWNER,
      Role.ADMIN,
    ]);

    const updatedBusiness = await this.prisma.business.update({
      where: { id: businessId },
      data: updateBusinessDto,
      include: {
        _count: {
          select: {
            userBusinesses: true,
            products: true,
          },
        },
      },
    });

    return {
      message: 'Negocio actualizado correctamente',
      business: this.formatBusinessResponse(
        updatedBusiness,
        userBusiness.role,
        updatedBusiness._count.userBusinesses,
      ),
    };
  }

  async remove(
    businessId: string,
    userId: string,
  ): Promise<{ message: string }> {
    // Solo el propietario puede eliminar el negocio
    await this.checkUserPermissions(businessId, userId, [Role.OWNER]);

    // Verificar que no tenga productos activos
    const activeProducts = await this.prisma.product.count({
      where: {
        businessId,
        isActive: true,
      },
    });

    if (activeProducts > 0) {
      throw new BadRequestException(
        'No se puede eliminar un negocio con productos activos',
      );
    }

    // Eliminar relaciones y el negocio
    await this.prisma.$transaction([
      this.prisma.userBusiness.deleteMany({
        where: { businessId },
      }),
      this.prisma.business.delete({
        where: { id: businessId },
      }),
    ]);

    return {
      message: 'Negocio eliminado correctamente',
    };
  }

  async getStats(
    businessId: string,
    userId: string,
  ): Promise<BusinessStatsDto> {
    // Verificar acceso
    await this.checkUserPermissions(businessId, userId);

    const [products, employees, sales, categories] = await Promise.all([
      this.prisma.product.aggregate({
        where: { businessId },
        _count: { id: true },
      }),
      this.prisma.userBusiness.count({
        where: { businessId },
      }),
      this.prisma.sale.aggregate({
        where: { businessId },
        _count: { id: true },
        _sum: { total: true },
      }),
      this.prisma.category.count({
        where: { businessId },
      }),
    ]);

    const activeProducts = await this.prisma.product.count({
      where: {
        businessId,
        isActive: true,
      },
    });

    // Actividad reciente (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentProducts, recentSales, recentEmployees] = await Promise.all([
      this.prisma.product.count({
        where: {
          businessId,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.sale.count({
        where: {
          businessId,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.userBusiness.count({
        where: {
          businessId,
          joinedAt: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    return {
      totalProducts: products._count.id,
      totalEmployees: employees,
      totalSales: sales._count.id,
      totalRevenue: sales._sum.total || 0,
      activeProducts,
      categoriesCount: categories,
      recentActivity: {
        productsAdded: recentProducts,
        salesMade: recentSales,
        employeesJoined: recentEmployees,
      },
    };
  }

  async getEmployees(
    businessId: string,
    userId: string,
  ): Promise<EmployeeResponseDto[]> {
    // Verificar acceso
    await this.checkUserPermissions(businessId, userId);

    const employees = await this.prisma.userBusiness.findMany({
      where: { businessId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return employees.map((emp) => ({
      id: emp.user.id,
      name: emp.user.name || 'Sin nombre',
      email: emp.user.email,
      role: emp.role,
      joinedAt: emp.joinedAt,
      isActive: emp.user?.isActive ?? true,
    }));
  }

  async inviteEmployee(
    businessId: string,
    userId: string,
    inviteDto: InviteEmployeeDto,
  ): Promise<{ message: string }> {
    // Solo propietarios y admins pueden invitar
    await this.checkUserPermissions(businessId, userId, [
      Role.OWNER,
      Role.ADMIN,
    ]);

    // Verificar si el usuario ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: inviteDto.email },
    });

    if (existingUser) {
      // Verificar si ya es empleado del negocio
      const existingEmployee = await this.prisma.userBusiness.findUnique({
        where: {
          userId_businessId: {
            userId: existingUser.id,
            businessId,
          },
        },
      });

      if (existingEmployee) {
        throw new BadRequestException(
          'El usuario ya es empleado de este negocio',
        );
      }

      // Agregar al negocio
      await this.prisma.userBusiness.create({
        data: {
          userId: existingUser.id,
          businessId,
          role: inviteDto.role || Role.EMPLOYEE,
        },
      });

      return {
        message: 'Usuario agregado al negocio correctamente',
      };
    } else {
      // TODO: Implementar sistema de invitaciones por email
      // Por ahora, solo agregamos usuarios existentes
      throw new BadRequestException(
        'El usuario debe registrarse primero en el sistema',
      );
    }
  }

  async updateSettings(
    businessId: string,
    userId: string,
    settingsDto: BusinessSettingsDto,
  ): Promise<{ message: string }> {
    // Solo propietarios y admins pueden cambiar configuraciones
    await this.checkUserPermissions(businessId, userId, [
      Role.OWNER,
      Role.ADMIN,
    ]);

    // TODO: Implementar tabla de configuraciones del negocio
    // Por ahora, retornamos un mensaje de éxito
    return {
      message: 'Configuraciones actualizadas correctamente',
    };
  }

  // Métodos auxiliares
  private async checkUserPermissions(
    businessId: string,
    userId: string,
    allowedRoles?: Role[],
  ) {
    const userBusiness = await this.prisma.userBusiness.findUnique({
      where: {
        userId_businessId: {
          userId,
          businessId,
        },
      },
    });

    if (!userBusiness) {
      throw new NotFoundException('Negocio no encontrado o sin acceso');
    }

    if (allowedRoles && !allowedRoles.includes(userBusiness.role)) {
      throw new ForbiddenException('No tienes permisos para esta acción');
    }

    return userBusiness;
  }

  private formatBusinessResponse(
    business: any,
    userRole: Role,
    employeeCount?: number,
  ): BusinessResponseDto {
    return {
      id: business.id,
      name: business.name,
      description: business.description,
      address: business.address,
      phone: business.phone,
      email: business.email,
      website: business.website,
      logo: business.logo,
      createdAt: business.createdAt,
      userRole,
      employeeCount,
    };
  }
}
