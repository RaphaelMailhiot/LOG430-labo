// src/services/productService.ts
import { db } from '../db/database';
import { Product } from '../models/product';

/**
 * Recherche des produits par ID, nom ou catégorie.
 */
export const findProducts = (search: string): Product[] => {
  const q = `%${search.trim().toLowerCase()}%`;
  const exact = search.trim();
  const stmt = db.prepare(`
    SELECT * FROM products
    WHERE LOWER(name) LIKE ?
       OR LOWER(category) LIKE ?
       OR CAST(id AS TEXT) = ?
  `);
  return stmt.all(q, q, exact) as Product[];
};

/**
 * Récupère un produit par son ID.
 */
export const getProductById = (id: number): Product | undefined => {
    const stmt = db.prepare(`SELECT * FROM products WHERE id = ?`);
    return stmt.get(id) as Product | undefined;
};

export const updateStock = (id: number, delta: number): void => {
  db.prepare(`UPDATE products SET stock = stock + ? WHERE id = ?`)
    .run(delta, id);
};
