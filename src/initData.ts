import { AppDataSource } from './data-source';
import { Product } from './entities/Product';

export async function initProducts() {
  const repo = AppDataSource.getRepository(Product);
  const count = await repo.count();
  if (count === 0) {
    await repo.save([
      repo.create({ name: 'Clavier', category: 'Informatique', price: 49.99, stock: 20 }),
      repo.create({ name: 'Souris', category: 'Informatique', price: 19.99, stock: 35 }),
      repo.create({ name: 'Écran', category: 'Informatique', price: 199.99, stock: 10 }),
      repo.create({ name: 'Câble HDMI', category: 'Accessoires', price: 9.99, stock: 50 }),
      repo.create({ name: 'Casque audio', category: 'Audio', price: 59.99, stock: 15 }),
    ]);
  }
}