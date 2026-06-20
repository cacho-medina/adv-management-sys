import { PartialType } from '@nestjs/mapped-types';
import { CreateSaleDto } from './create-sale.dto';
import { SaleStatus } from '@prisma/client';

export class UpdateSaleDto extends PartialType(CreateSaleDto) {
  clientId?: string;
  items?: { productId: string; quantity: number; price: number }[];
  
  // Campos de descuentos
  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'COUPON' | 'LOYALTY' | 'BULK' | 'BUY_X_GET_Y';
  discountValue?: number;
  couponCode?: string;
  discounts?: {
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'COUPON' | 'LOYALTY' | 'BULK' | 'BUY_X_GET_Y';
    value: number;
    description?: string;
    couponCode?: string;
  }[];

  // Campos de pagos
  payments?: {
    amount: number;
    method: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'DIGITAL_WALLET' | 'CHECK' | 'OTHER';
    reference?: string;
    notes?: string;
  }[];

  clientData?: {
    dni?: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  status?: SaleStatus;
}
