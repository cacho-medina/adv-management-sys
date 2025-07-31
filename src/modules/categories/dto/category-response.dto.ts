export class CategoryResponseDto {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  businessId?: string; // null = global, string = específica
  parentId?: string;
  isGlobal: boolean;
  children?: CategoryResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class CategoryListResponseDto {
  categories: CategoryResponseDto[];
  total: number;
  globalCategories: number;
  businessCategories: number;
}
