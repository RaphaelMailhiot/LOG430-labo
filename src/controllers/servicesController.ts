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

  async handleSale() {
    const items: { productId: number; quantity: number }[] = [];
    let ajouter = true;

    while (ajouter) {
      const { id, qty } = await inquirer.prompt<{ id: number; qty: number }>([
        {
          type: 'number',
          name: 'id',
          message: 'ID produit ?'
        },
        {
          type: 'number',
          name: 'qty',
          message: 'Quantité ?'
        }
      ]);

      items.push({ productId: id, quantity: qty });

      const { more } = await inquirer.prompt<{ more: boolean }>([
        {
          type: 'confirm',
          name: 'more',
          message: 'Ajouter un autre produit ?'
        }
      ]);
      ajouter = more;
    }

    // On récupère les prix pour calculer le total
    const saleItems = [];
    for (const it of items) {
      const p = await getProductById(it.productId);
      if (!p) throw new Error(`Produit ${it.productId} introuvable`);
      saleItems.push({ productId: it.productId, quantity: it.quantity, price: p.price });
    }

    const total = saleItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
    console.log(`Total de la vente : $${total.toFixed(2)}`);

    const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Confirmer la vente ?'
      }
    ]);
    if (confirm) {
      const saleId = await recordSale(saleItems);
      console.log(`Vente #${saleId} enregistrée.`);
    } else {
      console.log('Vente annulée.');
    }
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