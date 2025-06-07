import { AppDataSource } from '../data-source';
import { Product } from '../entities/Product';
import { Sale } from '../entities/Sale';
import { SaleItem } from '../entities/SaleItem';
import { Store } from '../entities/Store';
import { In } from 'typeorm';

/**
 * Enregistre une vente pour un magasin et décale le stock.
 * @returns l’ID de la vente créée
 */
export const recordSale = async (
  items: { productId: number; quantity: number; price: number }[],
  storeId: number
): Promise<number> => {
  const saleRepo = AppDataSource.getRepository(Sale);
  const saleItemRepo = AppDataSource.getRepository(SaleItem);
  const productRepo = AppDataSource.getRepository(Product);

  // Création de la vente
  const storeRepo = AppDataSource.getRepository(Store);
  const sale = new Sale();
  sale.store = await storeRepo.findOneByOrFail({ id: storeId });
  await saleRepo.save(sale);

  // Création des items et mise à jour du stock
  for (const it of items) {
    const product = await productRepo.findOneByOrFail({ id: it.productId, store: { id: storeId } });
    if (product.stock < it.quantity) {
      throw new Error(`Stock insuffisant pour le produit ${product.name}`);
    }
    product.stock -= it.quantity;
    await productRepo.save(product);

    const saleItem = new SaleItem();
    saleItem.sale_id = sale.id;
    saleItem.product_id = it.productId;
    saleItem.quantity = it.quantity;
    saleItem.price = it.price;
    await saleItemRepo.save(saleItem);
  }

  return sale.id;
};

/**
 * Annule une vente et rétablit le stock pour un magasin donné.
 */
export const cancelSale = async (saleId: number, storeId: number): Promise<void> => {
  const saleItemRepo = AppDataSource.getRepository(SaleItem);
  const productRepo = AppDataSource.getRepository(Product);
  const saleRepo = AppDataSource.getRepository(Sale);

  // Vérifie que la vente appartient bien au magasin
  await saleRepo.findOneByOrFail({ id: saleId, store: { id: storeId } });

  const items = await saleItemRepo.find({ where: { sale_id: saleId } });

  for (const it of items) {
    const product = await productRepo.findOneByOrFail({ id: it.product_id, store: { id: storeId } });
    product.stock += it.quantity;
    await productRepo.save(product);
  }

  await saleItemRepo.delete({ sale_id: saleId });
  await saleRepo.delete({ id: saleId, store: { id: storeId } });
};

/**
 * Récupère toutes les ventes passées pour un magasin donné.
 */
export const findOldSales = async (storeId: number): Promise<any[]> => {
  const saleItemRepo = AppDataSource.getRepository(SaleItem);
  const saleRepo = AppDataSource.getRepository(Sale);

  // On récupère les ventes du magasin
  const sales = await saleRepo.find({ where: { store: { id: storeId } } });
  const saleIds = sales.map(s => s.id);

  const items = await saleItemRepo.find({ where: saleIds.length ? { sale_id: In(saleIds) } : undefined });

  // Regrouper les items par sale_id
  const grouped: Record<number, any> = {};
  for (const item of items) {
    if (!grouped[item.sale_id]) {
      grouped[item.sale_id] = {
        sale_id: item.sale_id,
        items: []
      };
    }
    grouped[item.sale_id].items.push(item);
  }

  return Object.values(grouped);
};