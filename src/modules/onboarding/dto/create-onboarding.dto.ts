import { ProductType } from '@prisma/client';

export class CreateProfileOnboardingDto {
  userId: string;
  username: string;
  avatar: string;
  phone: string;
  secondaryEmail: string;
  description: string;
}
export class CreateBusinessOnboardingDto {
  userId: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
}
export class CreateCategoriesOnboardingDto {
  name: string;
  description: string;
  icon: string;
  color: string;
}
export class CreateProductsOnboardingDto {
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
