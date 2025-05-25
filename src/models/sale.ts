export interface SaleItem {
  productId: number;
  quantity: number;
  price: number; // prix unitaire au moment de la vente
}

export interface Sale {
  id?: number;
  date?: string;
  items: SaleItem[];
}
