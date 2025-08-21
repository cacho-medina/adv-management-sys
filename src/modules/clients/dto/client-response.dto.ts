export class ClientResponseDto {
  id: string;
  dni?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  businessId: string;
  createdAt: Date;
  updatedAt: Date;
  salesCount?: number;
  totalPurchases?: number;
}

export class ClientListResponseDto {
  clients: ClientResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ClientStatsDto {
  totalSales: number;
  totalAmount: number;
  averageOrderValue: number;
  lastPurchaseDate?: Date;
  firstPurchaseDate?: Date;
  favoriteProducts?: {
    productId: string;
    productName: string;
    purchaseCount: number;
  }[];
}