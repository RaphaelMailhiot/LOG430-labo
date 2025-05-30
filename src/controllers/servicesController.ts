import { findProducts, getProductById, addProduct } from '../services/productService';
import { recordSale, cancelSale, findOldSales } from '../services/saleService';

export class ServicesController {
  async handleSearch(productNameInput: string) {
    const produits = await findProducts(productNameInput);
    return produits;
  }

  async handleAddProduct(name: string, category: string, price: number, stock: number) {
    const produit = await addProduct({ name, category, price, stock }); 
    if (!produit) {
      return false;
    }
    return true;
  }

  async handleSale(items: { productId: number; quantity: number }[] = []) {
    const saleItems = [];
    for (const it of items) {
      const p = await getProductById(it.productId);
      if (!p) throw new Error(`Produit ${it.productId} introuvable`);
      saleItems.push({ productId: it.productId, quantity: it.quantity, price: p.price });
    }

    const total = Number(saleItems.reduce((sum, it) => sum + it.price * it.quantity, 0).toFixed(2));
    const id = await recordSale(saleItems);

    return { id, total }; // Enregistre la vente et retourne l'ID de la vente et le total
  }

  async handleReturn(saleId: number) {
    await cancelSale(saleId);
  }

  async handleOldSales() {
    const oldSales = await findOldSales();
    return oldSales; // Retourne toutes les ventes passées
  }

  async handleStock() {
    const produits = await findProducts(''); // récupère tout
    return produits;
  }
}