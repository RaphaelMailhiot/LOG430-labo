import { findProducts, getProductById, addProduct } from '../services/productService';
import { recordSale, cancelSale, findOldSales } from '../services/saleService';

export class ServicesController {
  async handleSearch(productNameInput: string, storeId: number) {
    const produits = await findProducts(productNameInput, storeId);
    return produits;
  }

  async handleAddProduct(name: string, category: string, price: number, stock: number, storeId: number) {
    const produit = await addProduct({ name, category, price, stock, storeId }); 
    if (!produit) {
      return false;
    }
    return true;
  }

  async handleSale(items: { productId: number; quantity: number }[] = [], storeId: number) {
    const saleItems = [];
    for (const it of items) {
      const p = await getProductById(it.productId, storeId);
      if (!p) throw new Error(`Produit ${it.productId} introuvable`);
      saleItems.push({ productId: it.productId, quantity: it.quantity, price: p.price });
    }

    const total = Number(saleItems.reduce((sum, it) => sum + it.price * it.quantity, 0).toFixed(2));
    const id = await recordSale(saleItems, storeId);

    return { id, total };
  }

  async handleReturn(saleId: number, storeId: number) {
    await cancelSale(saleId, storeId);
  }

  async handleOldSales(storeId: number) {
    const oldSales = await findOldSales(storeId);
    return oldSales;
  }

  async handleStock(storeId: number) {
    const produits = await findProducts('', storeId);
    return produits;
  }
}