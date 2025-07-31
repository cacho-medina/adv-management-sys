import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriesDto } from './create-category.dto';
import { IsUUID } from 'class-validator';

export class UpdateCategoryDto extends PartialType(CreateCategoriesDto) {
  @IsUUID()
  id: string;
}
