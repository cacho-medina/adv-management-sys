import { Injectable } from '@nestjs/common';
import { CreateProductsDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(newProduct: CreateProductsDto) {
    const {
      name,
      price,
      description,
      stock,
      type,
      sku,
      image,
      categoryId,
      attributes,
      businessId,
    } = newProduct;
    const product = await this.prisma.product.create({
      data: {
        name,
        price,
        description,
        stock,
        type,
        sku,
        isActive: stock > 0 ? true : false,
        isFeatured: false,
        business: { connect: { id: businessId } },
      },
    });
    return {
      message: 'Producto creado correctamente',
      product,
    };
  }

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
