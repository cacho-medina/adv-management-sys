export class CreateSaleDto {
  businessId: string;
  clientId?: string; // Opcional

  items: {
    productId: string;
    quantity: number;
    price: number; // Precio unitario (no subtotal)
  }[];

  clientData?: {
    dni?: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
}
