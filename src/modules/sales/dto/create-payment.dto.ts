export class CreatePaymentDto {
  saleId: string;
  businessId: string;
  amount: number;
  method: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'DIGITAL_WALLET' | 'CHECK' | 'OTHER';
  reference?: string;
  notes?: string;
}