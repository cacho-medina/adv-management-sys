import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductsDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import {
  ProductResponseDto,
  ProductListResponseDto,
} from './dto/product-response.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(
    newProduct: CreateProductsDto,
  ): Promise<{ message: string; product: ProductResponseDto }> {
    const {
      businessId,
      name,
      price,
      description,
      stock,
      type,
      sku,
      categoryIds,
      attributes,
      isFeatured,
    } = newProduct;

    // Verificar que el negocio existe
    const businessExists = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!businessExists) {
      throw new NotFoundException('Negocio no encontrado');
    }

    // Verificar SKU único si se proporciona
    if (sku) {
      const existingSku = await this.prisma.product.findFirst({
        where: {
          sku,
          businessId,
        },
      });

      if (existingSku) {
        throw new ConflictException('El SKU ya existe en este negocio');
      }
    }

    try {
      const product = await this.prisma.product.create({
        data: {
          name,
          price,
          description,
          stock,
          type,
          sku,
          isActive: stock > 0,
          isFeatured: isFeatured || false,
          businessId,
          // Crear atributos si se proporcionan
          productAttributes: attributes
            ? {
                create: attributes.map((attr) => ({
                  key: attr.key,
                  value: attr.value,
                  type: attr.type || 'text',
                })),
              }
            : undefined,
          // Conectar categorías si se proporcionan
          productCategories: categoryIds
            ? {
                create: categoryIds.map((categoryId) => ({
                  categoryId,
                })),
              }
            : undefined,
        },
        include: {
          productAttributes: true,
          productCategories: {
            include: {
              category: true,
            },
          },
        },
      });

      return {
        message: 'Producto creado correctamente',
        product: this.formatProductResponse(product),
      };
    } catch (error) {
      throw new BadRequestException(
        'Error al crear el producto: ' + error.message,
      );
    }
  }

  async findAllByBusiness(
    businessId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    categoryId?: string,
    isActive?: boolean,
  ): Promise<ProductListResponseDto> {
    const skip = (page - 1) * limit;

    const where: any = {
      businessId,
    };

    // Filtros opcionales
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.productCategories = {
        some: {
          categoryId,
        },
      };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          productAttributes: true,
          productCategories: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products: products.map((product) => this.formatProductResponse(product)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener un producto específico
   */
  async findOne(id: string, businessId: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        businessId,
      },
      include: {
        productAttributes: true,
        productCategories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return this.formatProductResponse(product);
  }

  /**
   * Actualizar un producto
   */
  async update(
    id: string,
    businessId: string,
    updateProductDto: UpdateProductDto,
  ): Promise<{ message: string; product: ProductResponseDto }> {
    const {
      name,
      price,
      description,
      stock,
      type,
      sku,
      categoryIds,
      attributes,
      isFeatured,
    } = updateProductDto;

    // Verificar que el producto existe
    const existingProduct = await this.prisma.product.findFirst({
      where: { id, businessId },
    });

    if (!existingProduct) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Verificar SKU único si se está actualizando
    if (sku && sku !== existingProduct.sku) {
      const existingSku = await this.prisma.product.findFirst({
        where: {
          sku,
          businessId,
          id: { not: id },
        },
      });

      if (existingSku) {
        throw new ConflictException('El SKU ya existe en este negocio');
      }
    }

    try {
      // Usar transacción para actualizar producto y relaciones
      const updatedProduct = await this.prisma.$transaction(async (prisma) => {
        // Actualizar producto principal
        const product = await prisma.product.update({
          where: { id },
          data: {
            ...(name && { name }),
            ...(price !== undefined && { price }),
            ...(description !== undefined && { description }),
            ...(stock !== undefined && { stock, isActive: stock > 0 }),
            ...(type && { type }),
            ...(sku !== undefined && { sku }),
            ...(isFeatured !== undefined && { isFeatured }),
          },
        });

        // Actualizar atributos si se proporcionan
        if (attributes) {
          // Eliminar atributos existentes
          await prisma.productAttribute.deleteMany({
            where: { productId: id },
          });

          // Crear nuevos atributos
          await prisma.productAttribute.createMany({
            data: attributes.map((attr) => ({
              productId: id,
              key: attr.key,
              value: attr.value,
              type: attr.type || 'text',
            })),
          });
        }

        // Actualizar categorías si se proporcionan
        if (categoryIds) {
          // Eliminar relaciones existentes
          await prisma.productCategory.deleteMany({
            where: { productId: id },
          });

          // Crear nuevas relaciones
          await prisma.productCategory.createMany({
            data: categoryIds.map((categoryId) => ({
              productId: id,
              categoryId,
            })),
          });
        }

        return product;
      });

      // Obtener producto actualizado con relaciones
      const productWithRelations = await this.prisma.product.findUnique({
        where: { id },
        include: {
          productAttributes: true,
          productCategories: {
            include: {
              category: true,
            },
          },
        },
      });

      return {
        message: 'Producto actualizado correctamente',
        product: this.formatProductResponse(productWithRelations),
      };
    } catch (error) {
      throw new BadRequestException(
        'Error al actualizar el producto: ' + error.message,
      );
    }
  }

  /**
   * Eliminar un producto (soft delete)
   */
  async remove(id: string, businessId: string): Promise<{ message: string }> {
    const product = await this.prisma.product.findFirst({
      where: { id, businessId },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    try {
      await this.prisma.product.update({
        where: { id },
        data: {
          isActive: false,
        },
      });

      return {
        message: 'Producto eliminado correctamente',
      };
    } catch (error) {
      throw new BadRequestException(
        'Error al eliminar el producto: ' + error.message,
      );
    }
  }

  /**
   * Eliminar permanentemente un producto
   */
  async hardDelete(
    id: string,
    businessId: string,
  ): Promise<{ message: string }> {
    const product = await this.prisma.product.findFirst({
      where: { id, businessId },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    try {
      await this.prisma.$transaction(async (prisma) => {
        // Eliminar atributos
        await prisma.productAttribute.deleteMany({
          where: { productId: id },
        });

        // Eliminar relaciones con categorías
        await prisma.productCategory.deleteMany({
          where: { productId: id },
        });

        // Eliminar producto
        await prisma.product.delete({
          where: { id },
        });
      });

      return {
        message: 'Producto eliminado permanentemente',
      };
    } catch (error) {
      throw new BadRequestException(
        'Error al eliminar el producto: ' + error.message,
      );
    }
  }

  /**
   * Formatear respuesta del producto
   */
  private formatProductResponse(product: any): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      stock: product.stock,
      type: product.type,
      sku: product.sku,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      businessId: product.businessId,
      attributes:
        product.productAttributes?.map((attr) => ({
          id: attr.id,
          key: attr.key,
          value: attr.value,
          type: attr.type,
        })) || [],
      categories:
        product.productCategories?.map((pc) => ({
          id: pc.category.id,
          name: pc.category.name,
          description: pc.category.description,
          icon: pc.category.icon,
          color: pc.category.color,
        })) || [],
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
