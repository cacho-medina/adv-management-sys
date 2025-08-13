import { ProductType } from '@prisma/client';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
  ValidateNested,
  IsBoolean,
  Min,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

class ProductAttributeDto {
  @IsString()
  @MaxLength(50)
  key: string;

  @IsString()
  @MaxLength(255)
  value: string;

  @IsString()
  @IsOptional()
  type?: string = 'text';
}

export class CreateProductsDto {
  @IsUUID()
  businessId: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsEnum(ProductType)
  type: ProductType;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  sku?: string;

  @IsUrl()
  @IsOptional()
  image?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  categoryIds?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeDto)
  @IsOptional()
  attributes?: ProductAttributeDto[];

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean = false;
}
