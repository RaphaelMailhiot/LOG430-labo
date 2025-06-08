import { AppDataSource } from './data-source';
import { Inventory } from './entities/Inventory';
import { Product } from './entities/Product';
import { Store } from './entities/Store';

export async function initStores() {
  const repo = AppDataSource.getRepository(Store);
  const count = await repo.count();
  if (count === 0) {
    await repo.save([
      repo.create({ name: 'Maison mère', isMain: true }),
      repo.create({ name: 'Magasin Montréal' }),
      repo.create({ name: 'Magasin Québec' }),
      repo.create({ name: 'Magasin Saint-Hyacinthe' }),
    ]);
  }
}

export async function initProducts() {
  const productRepo = AppDataSource.getRepository(Product);
  const storeRepo = AppDataSource.getRepository(Store);
  const inventoryRepo = AppDataSource.getRepository(Inventory);

  const baseProducts = [
    { name: 'Clavier', category: 'Informatique', price: 49.99 },
    { name: 'Souris', category: 'Informatique', price: 19.99 },
    { name: 'Écran', category: 'Informatique', price: 199.99 },
    { name: 'Câble HDMI', category: 'Accessoires', price: 9.99 },
    { name: 'Casque audio', category: 'Audio', price: 59.99 },
  ];

  const stores = await storeRepo.find();
  const count = await productRepo.count();
  if (count === 0) {
    // Crée les produits globaux (une seule fois)
    const products = [];
    for (const base of baseProducts) {
      const product = await productRepo.save(productRepo.create(base));
      products.push(product);
    }
    // Crée l'inventaire pour chaque magasin et chaque produit
    for (const store of stores) {
      for (const product of products) {
        const stock = store.isMain ? 100 : 50;
        await inventoryRepo.save(
          inventoryRepo.create({ store, product, stock })
        );
      }
    }
  }
}