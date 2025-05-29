import inquirer from 'inquirer';
import { findProducts, getProductById, addProduct } from '../services/productService';
import { recordSale, cancelSale } from '../services/saleService';

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

  async handleReturn() {
    const { saleId } = await inquirer.prompt({
      name: 'saleId',
      message: 'Numéro de vente à annuler ?',
      type: 'number'
    });
    await cancelSale(saleId);
    console.log(`Vente #${saleId} annulée et stock remis à jour.`);
  }

  async handleStock() {
    const produits = await findProducts(''); // récupère tout
    return produits;
  }
}