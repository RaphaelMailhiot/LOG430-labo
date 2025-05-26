import { db } from '../src/db/database';
import { updateStock, getProductById } from '../src/services/productService';

describe('Vente de produit', () => {
  const nomProduit = 'TestProduit';
  const stockInitial = 10;
  let productId: number;

  beforeAll(() => {
    // Ajoute un produit de test
    db.prepare('INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)')
      .run(nomProduit, 'Test', 1.99, stockInitial);
    const row = db.prepare('SELECT id FROM products WHERE name = ?').get(nomProduit) as { id: number };
    productId = row.id;
  });

  afterAll(() => {
    // Nettoie le produit de test
    db.prepare('DELETE FROM products WHERE id = ?').run(productId);
  });

  test('le stock diminue après une vente', () => {
    updateStock(productId, -3); // Simule la vente de 3 unités
    const produit = getProductById(productId);
    expect(produit?.stock).toBe(stockInitial - 3);
  });
});