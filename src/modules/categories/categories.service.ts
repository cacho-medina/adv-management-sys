import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { CreateCategoriesDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  CategoryResponseDto,
  CategoryListResponseDto,
} from './dto/category-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear una nueva categoría
   */
  async create(
    createCategoryDto: CreateCategoriesDto,
    userRole: Role,
    userId: string,
  ): Promise<{ message: string; category: CategoryResponseDto }> {
    const { name, description, icon, color, businessId, parentId } =
      createCategoryDto;

    // Verificar si es categoría global (solo ADMIN puede crear)
    if (!businessId && userRole !== Role.ADMIN) {
      throw new ForbiddenException(
        'Solo los administradores pueden crear categorías globales',
      );
    }

    // Si es categoría específica, verificar que el negocio existe y el usuario tiene acceso
    if (businessId) {
      const userBusiness = await this.prisma.userBusiness.findFirst({
        where: {
          userId,
          businessId,
          role: { in: [Role.OWNER, Role.ADMIN] },
        },
      });

      if (!userBusiness) {
        throw new ForbiddenException(
          'No tienes permisos para crear categorías en este negocio',
        );
      }
    }

    // Verificar que el nombre no existe en el mismo contexto (global o negocio específico)
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
        businessId: businessId || null,
      },
    });

    if (existingCategory) {
      const context = businessId ? 'este negocio' : 'las categorías globales';
      throw new ConflictException(
        `Ya existe una categoría con este nombre en ${context}`,
      );
    }

    // Verificar categoría padre si se proporciona
    if (parentId) {
      const parentCategory = await this.prisma.category.findFirst({
        where: {
          id: parentId,
          businessId: businessId || null, // Debe estar en el mismo contexto
        },
      });

      if (!parentCategory) {
        throw new NotFoundException(
          'Categoría padre no encontrada en el contexto especificado',
        );
      }
    }

    try {
      const category = await this.prisma.category.create({
        data: {
          name,
          description,
          icon,
          color,
          businessId,
          parentId,
        },
        include: {
          parent: true,
          children: true,
        },
      });

      return {
        message: businessId
          ? 'Categoría específica creada correctamente'
          : 'Categoría global creada correctamente',
        category: this.formatCategoryResponse(category),
      };
    } catch (error) {
      throw new BadRequestException(
        'Error al crear la categoría: ' + error.message,
      );
    }
  }

  /**
   * Obtener todas las categorías (globales y específicas)
   */
  async findAll(
    businessId?: string,
    includeGlobal: boolean = true,
    includeHierarchy: boolean = false,
  ): Promise<CategoryListResponseDto> {
    const where: any = {};

    if (businessId && includeGlobal) {
      // Incluir categorías globales y específicas del negocio
      where.OR = [
        { businessId: null }, // Globales
        { businessId }, // Específicas del negocio
      ];
    } else if (businessId && !includeGlobal) {
      // Solo categorías específicas del negocio
      where.businessId = businessId;
    } else if (!businessId && includeGlobal) {
      // Solo categorías globales
      where.businessId = null;
    }

    const categories = await this.prisma.category.findMany({
      where,
      include: {
        parent: true,
        children: includeHierarchy,
        _count: {
          select: {
            productCategories: true,
          },
        },
      },
      orderBy: [
        { businessId: 'asc' }, // Globales primero (null)
        { name: 'asc' },
      ],
    });

    const globalCount = categories.filter((cat) => !cat.businessId).length;
    const businessCount = categories.filter((cat) => cat.businessId).length;

    return {
      categories: categories.map((category) =>
        this.formatCategoryResponse(category),
      ),
      total: categories.length,
      globalCategories: globalCount,
      businessCategories: businessCount,
    };
  }

  /**
   * Obtener categorías globales únicamente
   */
  async findGlobalCategories(): Promise<CategoryResponseDto[]> {
    const categories = await this.prisma.category.findMany({
      where: {
        businessId: null,
      },
      include: {
        children: {
          where: {
            businessId: null,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return categories.map((category) => this.formatCategoryResponse(category));
  }

  /**
   * Obtener categorías específicas de un negocio
   */
  async findByBusiness(
    businessId: string,
    userId: string,
    includeGlobal: boolean = true,
  ): Promise<CategoryResponseDto[]> {
    // Verificar acceso al negocio
    const userBusiness = await this.prisma.userBusiness.findFirst({
      where: {
        userId,
        businessId,
      },
    });

    if (!userBusiness) {
      throw new ForbiddenException('No tienes acceso a este negocio');
    }

    const result = await this.findAll(businessId, includeGlobal, true);
    return result.categories;
  }

  /**
   * Obtener una categoría específica
   */
  async findOne(
    id: string,
    userId: string,
    userRole: Role,
  ): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        business: true,
        _count: {
          select: {
            productCategories: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Verificar acceso si es categoría específica
    if (category.businessId) {
      const userBusiness = await this.prisma.userBusiness.findFirst({
        where: {
          userId,
          businessId: category.businessId,
        },
      });

      if (!userBusiness) {
        throw new ForbiddenException('No tienes acceso a esta categoría');
      }
    }

    return this.formatCategoryResponse(category);
  }

  /**
   * Actualizar una categoría
   */
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    userId: string,
    userRole: Role,
  ): Promise<{ message: string; category: CategoryResponseDto }> {
    const { name, description, icon, color, parentId } = updateCategoryDto;

    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Verificar permisos
    if (!existingCategory.businessId && userRole !== Role.ADMIN) {
      throw new ForbiddenException(
        'Solo los administradores pueden modificar categorías globales',
      );
    }

    if (existingCategory.businessId) {
      const userBusiness = await this.prisma.userBusiness.findFirst({
        where: {
          userId,
          businessId: existingCategory.businessId,
          role: { in: [Role.OWNER, Role.ADMIN] },
        },
      });

      if (!userBusiness) {
        throw new ForbiddenException(
          'No tienes permisos para modificar esta categoría',
        );
      }
    }

    // Verificar nombre único si se está cambiando
    if (name && name !== existingCategory.name) {
      const duplicateName = await this.prisma.category.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive',
          },
          businessId: existingCategory.businessId,
          id: { not: id },
        },
      });

      if (duplicateName) {
        const context = existingCategory.businessId
          ? 'este negocio'
          : 'las categorías globales';
        throw new ConflictException(
          `Ya existe una categoría con este nombre en ${context}`,
        );
      }
    }

    // Verificar categoría padre si se está cambiando
    if (parentId && parentId !== existingCategory.parentId) {
      // No puede ser su propio padre o crear ciclos
      if (parentId === id) {
        throw new BadRequestException(
          'Una categoría no puede ser su propio padre',
        );
      }

      const parentCategory = await this.prisma.category.findFirst({
        where: {
          id: parentId,
          businessId: existingCategory.businessId,
        },
      });

      if (!parentCategory) {
        throw new NotFoundException(
          'Categoría padre no encontrada en el contexto especificado',
        );
      }

      // Verificar que no se cree un ciclo
      const wouldCreateCycle = await this.checkForCycle(parentId, id);
      if (wouldCreateCycle) {
        throw new BadRequestException(
          'Esta operación crearía un ciclo en la jerarquía de categorías',
        );
      }
    }

    try {
      const updatedCategory = await this.prisma.category.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(icon !== undefined && { icon }),
          ...(color !== undefined && { color }),
          ...(parentId !== undefined && { parentId }),
        },
        include: {
          parent: true,
          children: true,
        },
      });

      return {
        message: 'Categoría actualizada correctamente',
        category: this.formatCategoryResponse(updatedCategory),
      };
    } catch (error) {
      throw new BadRequestException(
        'Error al actualizar la categoría: ' + error.message,
      );
    }
  }

  /**
   * Eliminar una categoría
   */
  async remove(
    id: string,
    userId: string,
    userRole: Role,
  ): Promise<{ message: string }> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        productCategories: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Verificar permisos
    if (!category.businessId && userRole !== Role.ADMIN) {
      throw new ForbiddenException(
        'Solo los administradores pueden eliminar categorías globales',
      );
    }

    if (category.businessId) {
      const userBusiness = await this.prisma.userBusiness.findFirst({
        where: {
          userId,
          businessId: category.businessId,
          role: { in: [Role.OWNER, Role.ADMIN] },
        },
      });

      if (!userBusiness) {
        throw new ForbiddenException(
          'No tienes permisos para eliminar esta categoría',
        );
      }
    }

    // Verificar si tiene productos asociados
    if (category.productCategories.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar una categoría que tiene productos asociados',
      );
    }

    // Verificar si tiene subcategorías
    if (category.children.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar una categoría que tiene subcategorías',
      );
    }

    try {
      await this.prisma.category.delete({
        where: { id },
      });

      const context = category.businessId ? 'específica' : 'global';
      return {
        message: `Categoría ${context} eliminada correctamente`,
      };
    } catch (error) {
      throw new BadRequestException(
        'Error al eliminar la categoría: ' + error.message,
      );
    }
  }

  /**
   * Verificar si una operación crearía un ciclo en la jerarquía
   */
  private async checkForCycle(
    parentId: string,
    childId: string,
  ): Promise<boolean> {
    let currentParentId = parentId;

    while (currentParentId) {
      if (currentParentId === childId) {
        return true; // Se encontró un ciclo
      }

      const parent = await this.prisma.category.findUnique({
        where: { id: currentParentId },
        select: { parentId: true },
      });

      currentParentId = parent?.parentId || null;
    }

    return false;
  }

  /**
   * Formatear respuesta de categoría
   */
  private formatCategoryResponse(category: any): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      businessId: category.businessId,
      parentId: category.parentId,
      isGlobal: !category.businessId,
      children:
        category.children?.map((child) => this.formatCategoryResponse(child)) ||
        [],
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
