export class CreateSaleDto {
  businessId: string;
  clientId?: string;

  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];

  // Nuevos campos para descuentos
  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'COUPON' | 'LOYALTY' | 'BULK' | 'BUY_X_GET_Y';
  discountValue?: number;
  couponCode?: string;
  
  // Para descuentos múltiples (opcional)
  discounts?: {
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'COUPON' | 'LOYALTY' | 'BULK' | 'BUY_X_GET_Y';
    value: number;
    description?: string;
    couponCode?: string;
  }[];

  // Nuevos campos para pagos
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
}
