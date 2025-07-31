import { PartialType } from '@nestjs/mapped-types';
import { CreateProductsDto } from './create-product.dto';
import { IsUUID } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductsDto) {
  @IsUUID()
  id: string;
}
