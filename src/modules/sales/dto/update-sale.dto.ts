import { PartialType } from '@nestjs/mapped-types';
import { CreateSaleDto } from './create-sale.dto';
import { SaleStatus } from '@prisma/client';

export class UpdateSaleDto extends PartialType(CreateSaleDto) {
  clientId?: string;
  items?: { productId: string; quantity: number; price: number }[];
  clientData?: {
    dni?: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  status?: SaleStatus;
}
