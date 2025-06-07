import { AppDataSource } from './data-source';
import { Product } from './entities/Product';
import { Store } from './entities/Store';

export async function initStores() {
  const repo = AppDataSource.getRepository(Store);
  const count = await repo.count();
  if (count === 0) {
    await repo.save([
      repo.create({ name: 'Maison mère', isMain: true }),
      repo.create({ name: 'Magasin Montréal', isMain: false }),
      repo.create({ name: 'Magasin Québec', isMain: false }),
      repo.create({ name: 'Magasin Saint-Hyacinthe', isMain: false }),
    ]);
  }
}

export async function initProducts() {
  const storeRepo = AppDataSource.getRepository(Store);
  const productRepo = AppDataSource.getRepository(Product);

  const mainStore = await storeRepo.findOneBy({ isMain: true });
  const stores = await storeRepo.find();
  const baseProducts = [
    { name: 'Clavier', category: 'Informatique', price: 49.99 },
    { name: 'Souris', category: 'Informatique', price: 19.99 },
    { name: 'Écran', category: 'Informatique', price: 199.99 },
    { name: 'Câble HDMI', category: 'Accessoires', price: 9.99 },
    { name: 'Casque audio', category: 'Audio', price: 59.99 },
  ];

  // Vérifie si des produits existent déjà
  const count = await productRepo.count();
  if (count === 0) {
    for (const store of stores) {
      for (const base of baseProducts) {
        let stock: number;
        if (store === mainStore) {
          // Stock fixe pour la maison mère
          stock = 100;
        } else {
          // Stock aléatoire pour les autres magasins
          stock = Math.floor(Math.random() * 50) + 10;
        }
        await productRepo.save(
          productRepo.create({ ...base, stock, store })
        );
      }
    }
  }
}