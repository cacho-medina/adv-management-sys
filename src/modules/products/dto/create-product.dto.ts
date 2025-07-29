import { ProductType } from '@prisma/client';

/* export class CreateCategoriesDto {
    name: string;
    description: string;
    icon: string;
    color: string;
  } */
export class CreateProductsDto {
  businessId: string;
  name: string;
  price: number;
  description: string;
  stock: number;
  type: ProductType;
  sku: string;
  image: string;
  categoryId: string;
  attributes: {
    name: string;
  }[];
}
