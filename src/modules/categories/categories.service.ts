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
  ): Promise<{ message: string; category: CategoryResponseDto }> {
    const { name, description, icon, color, businessId, parentId } =
      createCategoryDto;

    const existingCategory = await this.prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
        businessId,
      },
    });

    if (existingCategory) {
      throw new ConflictException(
        'Ya existe una categoría con este nombre en este negocio',
      );
    }

    // Verificar categoría padre si se proporciona
    if (parentId) {
      const parentCategory = await this.prisma.category.findFirst({
        where: {
          id: parentId,
          businessId,
        },
      });

      if (!parentCategory) {
        throw new NotFoundException(
          'No se encontró la categoria principal seleccionada',
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
        message: 'Categoría específica creada correctamente',
        category: this.formatCategoryResponse(category),
      };
    } catch (error) {
      throw new BadRequestException(
        'Error al crear la categoría: ' + error.message,
      );
    }
  }

  /**
   * Obtener todas las categorías
   */
  async findAll(
    businessId?: string,
    includeHierarchy: boolean = false,
  ): Promise<CategoryListResponseDto> {
    const where: any = {};

    if (businessId) {
      where.businessId = businessId;
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
      orderBy: [{ businessId: 'asc' }, { name: 'asc' }],
    });

    const businessCount = categories.filter((cat) => cat.businessId).length;

    return {
      categories: categories.map((category) =>
        this.formatCategoryResponse(category),
      ),
      total: categories.length,
      businessCategories: businessCount,
    };
  }

  /**
   * Obtener categorías específicas de un negocio
   */
  async findByBusiness(
    businessId: string,
    includeHierarchy: boolean = false,
  ): Promise<CategoryResponseDto[]> {
    // Verificar si el negocio existe
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new ForbiddenException('No se encontró el negocio especificado');
    }

    const result = await this.findAll(businessId, includeHierarchy);
    return result.categories;
  }

  /**
   * Obtener una categoría específica
   */
  async findOne(id: string): Promise<CategoryResponseDto> {
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

    return this.formatCategoryResponse(category);
  }

  /**
   * Actualizar una categoría
   */
  async update(
    businessId: string,
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<{ message: string; category: CategoryResponseDto }> {
    const { name, description, icon, color, parentId } = updateCategoryDto;

    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Verificar nombre único si se está cambiando
    if (name && name !== existingCategory.name) {
      const duplicateName = await this.prisma.category.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive',
          },
          businessId,
          id: { not: id },
        },
      });

      if (duplicateName) {
        throw new ConflictException(
          'Ya existe una categoría con este nombre en este negocio',
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
          businessId,
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
  async remove(id: string): Promise<{ message: string }> {
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

    try {
      await this.prisma.$transaction(async (prisma) => {
        // Eliminar subcategorías recursivamente
        if (category.children.length > 0) {
          for (const child of category.children) {
            await this.remove(child.id);
          }
        }

        // Eliminar relaciones con productos
        await prisma.productCategory.deleteMany({
          where: { categoryId: id },
        });

        // Eliminar la categoría
        await prisma.category.delete({
          where: { id },
        });
      });

      return {
        message: 'Categoría y relaciones eliminadas correctamente',
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
