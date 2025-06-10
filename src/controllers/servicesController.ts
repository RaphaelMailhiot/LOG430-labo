import { findProducts, getProductById, addProduct, getStoreInventory, createSupplyRequest } from '../services/productService';
import { recordSale, cancelSale, findOldSales } from '../services/saleService';

export class ServicesController {
  async handleSearch(productNameInput: string, storeId: number) {
    // Recherche les produits disponibles dans le magasin (via Inventory)
    return await findProducts(productNameInput, storeId);
  }

  async handleAddProduct(name: string, category: string, price: number, stock: number, storeId: number) {
    // Ajoute un produit global si besoin, puis crée l'entrée Inventory pour ce magasin
    const produit = await addProduct({ name, category, price, stock, storeId });
    return !!produit;
  }

  async handleSale(items: { productId: number; quantity: number }[] = [], storeId: number) {
    // Utilise Inventory pour vérifier et décrémenter le stock
    const saleItems = [];
    for (const it of items) {
      const p = await getProductById(it.productId); // Ne filtre plus par magasin
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
    return await findOldSales(storeId);
  }

  async handleStock(storeId: number) {
    // Retourne l'inventaire du magasin (produits + stock)
    return await getStoreInventory(storeId);
  }

  async handleSupplyRequest(productId: number, quantity: number, storeId: number) {
    return await createSupplyRequest(storeId, productId, quantity);
  }
}