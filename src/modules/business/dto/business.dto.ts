import { ProductType } from '@prisma/client';

export class CreateBusinessDto {
  userId: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
}
export class CreateCategoriesDto {
  name: string;
  description: string;
  icon: string;
  color: string;
}
export class CreateProductsDto {
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
