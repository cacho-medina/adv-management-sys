import { ProductType } from '@prisma/client';

export class ProductAttributeResponseDto {
  id: string;
  key: string;
  value: string;
  type: string;
}

export class ProductCategoryResponseDto {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export class ProductResponseDto {
  id: string;
  name: string;
  price: number;
  description?: string;
  stock: number;
  type: ProductType;
  sku?: string;
  barcode?: string;
  weight?: number;
  dimensions?: string;
  isActive: boolean;
  isFeatured: boolean;
  businessId: string;
  attributes: ProductAttributeResponseDto[];
  categories: ProductCategoryResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class ProductListResponseDto {
  products: ProductResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
