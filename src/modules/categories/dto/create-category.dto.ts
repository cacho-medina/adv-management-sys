import {
  IsString,
  IsOptional,
  IsUUID,
  MaxLength,
  IsHexColor,
  IsUrl,
} from 'class-validator';

export class CreateCategoriesDto {
  @IsString()
  @MaxLength(50)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  icon?: string; // Nombre del icono o clase CSS

  @IsHexColor()
  @IsOptional()
  color?: string; // Color en formato hexadecimal

  @IsUUID()
  businessId: string;

  @IsUUID()
  @IsOptional()
  parentId?: string; // Para jerarquía de categorías
}
