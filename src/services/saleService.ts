// src/services/saleService.ts
import { db } from '../db/database';
import { SaleItem } from '../models/sale';
import { updateStock } from './productService';

/**
 * Enregistre une vente et décale le stock.
 * @returns l’ID de la vente créée
 */
export function recordSale(items: SaleItem[]): number {
  const insertSale = db.prepare(`INSERT INTO sales DEFAULT VALUES`);
  const saleInfo = insertSale.run();
  const saleId = saleInfo.lastInsertRowid as number;

  const insertItem = db.prepare(`
    INSERT INTO sale_items(sale_id, product_id, quantity, price)
    VALUES (@saleId,@productId,@quantity,@price)
  `);

  const transaction = db.transaction(() => {
    for (const it of items) {
      insertItem.run({
        saleId,
        productId: it.productId,
        quantity: it.quantity,
        price: it.price
      });
      updateStock(it.productId, -it.quantity);
    }
  });
  transaction();
  return saleId;
}

/**
 * Annule une vente et rétablit le stock.
 */
export function cancelSale(saleId: number): void {
  const items = db.prepare(`
    SELECT product_id AS productId, quantity, price
    FROM sale_items
    WHERE sale_id = ?
  `).all(saleId) as SaleItem[];

  const transaction = db.transaction(() => {
    for (const it of items) {
      updateStock(it.productId, it.quantity);
    }
    db.prepare(`DELETE FROM sale_items WHERE sale_id = ?`).run(saleId);
    db.prepare(`DELETE FROM sales WHERE id = ?`).run(saleId);
  });
  transaction();
}
