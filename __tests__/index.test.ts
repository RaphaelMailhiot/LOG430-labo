import { DataSource, Repository } from 'typeorm';
import { Product } from '../src/entities/Product';

const updateStock = async (
  repo: Repository<Product>,
  id: number,
  delta: number
): Promise<void> => {
  await repo.increment({ id }, 'stock', delta);
};

const getProductById = async (
  repo: Repository<Product>,
  id: number
): Promise<Product | null> => {
  return repo.findOneBy({ id });
};

let dataSource: DataSource;
let productRepo: Repository<Product>;
let productId: number;

describe('Vente de produit', () => {
  const nomProduit = 'TestProduit';
  const stockInitial = 10;

  beforeAll(async () => {
    // Initialise la connexion TypeORM
    dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      entities: [Product],
    });
    await dataSource.initialize();

    // Prépare le repository
    productRepo = dataSource.getRepository(Product);

    // Ajoute un produit de test
    const product = productRepo.create({
      name: nomProduit,
      category: 'Test',
      price: 1.99,
      stock: stockInitial,
    });
    const savedProduct = await productRepo.save(product);
    productId = savedProduct.id;
  });

  afterAll(async () => {
    // Nettoie le produit de test et ferme la connexion
    await productRepo.delete(productId);
    await dataSource.destroy();
  });

  test('le stock diminue après une vente', async () => {
    await updateStock(productRepo, productId, -3); // Simule la vente de 3 unités
    const produit = await getProductById(productRepo, productId);
    expect(produit?.stock).toBe(stockInitial - 3);
  });
});