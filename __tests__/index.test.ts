import { DataSource, Repository } from 'typeorm';
import { Product } from '../src/entities/Product';
import { Store } from '../src/entities/Store';
import { Inventory } from '../src/entities/Inventory';
import { Sale } from '../src/entities/Sale';
import { SaleItem } from '../src/entities/SaleItem';

let dataSource: DataSource;
let productRepo: Repository<Product>;
let storeRepo: Repository<Store>;
let inventoryRepo: Repository<Inventory>;
let productId: number;
let storeId: number;

describe('Vente de produit via Inventory', () => {
  const nomProduit = 'TestProduit';
  const stockInitial = 10;

  beforeAll(async () => {
    // Initialise la connexion TypeORM avec PostgreSQL
    dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'labuser',
      password: process.env.DB_PASSWORD || 'labpassword',
      database: process.env.DB_NAME || 'labdb',
      synchronize: true,
      entities: [Product, Store, Inventory, Sale, SaleItem], // <-- ajoute Sale et SaleItem ici
    });
    await dataSource.initialize();

    productRepo = dataSource.getRepository(Product);
    storeRepo = dataSource.getRepository(Store);
    inventoryRepo = dataSource.getRepository(Inventory);

    // Ajoute un magasin de test
    const store = await storeRepo.save(storeRepo.create({ name: 'TestMagasin' }));
    storeId = store.id;

    // Ajoute un produit de test
    const product = await productRepo.save(productRepo.create({
      name: nomProduit,
      category: 'Test',
      price: 1.99,
    }));
    productId = product.id;

    // Ajoute l'inventaire pour ce magasin/produit
    await inventoryRepo.save(inventoryRepo.create({
      store,
      product,
      stock: stockInitial,
    }));
  });

  afterAll(async () => {
    if (inventoryRepo && productRepo && storeRepo) {
      await inventoryRepo.delete({});
      await productRepo.delete({});
      await storeRepo.delete({});
    }
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  test('le stock diminue après une vente', async () => {
    // Simule la vente de 3 unités
    const inventory = await inventoryRepo.findOneOrFail({
      where: { product: { id: productId }, store: { id: storeId } },
      relations: ['product', 'store'],
    });
    inventory.stock -= 3;
    await inventoryRepo.save(inventory);

    const updatedInventory = await inventoryRepo.findOneOrFail({
      where: { product: { id: productId }, store: { id: storeId } },
      relations: ['product', 'store'],
    });
    expect(updatedInventory.stock).toBe(stockInitial - 3);
  });
});