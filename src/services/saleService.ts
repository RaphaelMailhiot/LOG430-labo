import { In } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Inventory } from '../entities/Inventory';
import { Sale } from '../entities/Sale';
import { SaleItem } from '../entities/SaleItem';
import { Store } from '../entities/Store';

/**
 * Enregistre une vente pour un magasin et décale le stock dans Inventory.
 * @returns l’ID de la vente créée
 */
export const recordSale = async (
  items: { productId: number; quantity: number; price: number }[],
  storeId: number
): Promise<number> => {
  const saleRepo = AppDataSource.getRepository(Sale);
  const saleItemRepo = AppDataSource.getRepository(SaleItem);
  const inventoryRepo = AppDataSource.getRepository(Inventory);
  const storeRepo = AppDataSource.getRepository(Store);

  // Création de la vente
  const sale = new Sale();
  sale.store = await storeRepo.findOneByOrFail({ id: storeId });
  await saleRepo.save(sale);

  // Création des items et mise à jour du stock dans Inventory
  for (const it of items) {
    const inventory = await inventoryRepo.findOneOrFail({
      where: { product: { id: it.productId }, store: { id: storeId } },
      relations: ['product', 'store'],
    });
    if (inventory.stock < it.quantity) {
      throw new Error(`Stock insuffisant pour le produit ${inventory.product.name}`);
    }
    inventory.stock -= it.quantity;
    await inventoryRepo.save(inventory);

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
 * Annule une vente et rétablit le stock dans Inventory pour un magasin donné.
 */
export const cancelSale = async (saleId: number, storeId: number): Promise<void> => {
  const saleItemRepo = AppDataSource.getRepository(SaleItem);
  const saleRepo = AppDataSource.getRepository(Sale);
  const inventoryRepo = AppDataSource.getRepository(Inventory);

  // Vérifie que la vente appartient bien au magasin
  await saleRepo.findOneByOrFail({ id: saleId, store: { id: storeId } });

  const items = await saleItemRepo.find({ where: { sale_id: saleId } });

  for (const it of items) {
    const inventory = await inventoryRepo.findOneOrFail({
      where: { product: { id: it.product_id }, store: { id: storeId } },
      relations: ['product', 'store'],
    });
    inventory.stock += it.quantity;
    await inventoryRepo.save(inventory);
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

  // On récupère les items avec la relation produit
  const items = await saleItemRepo.find({
    where: saleIds.length ? { sale_id: In(saleIds) } : undefined,
    relations: ['product'],
  });

  // Regrouper les items par sale_id
  const grouped: Record<number, any> = {};
  for (const item of items) {
    if (!grouped[item.sale_id]) {
      grouped[item.sale_id] = {
        sale_id: item.sale_id,
        items: []
      };
    }
    grouped[item.sale_id].items.push({
      ...item,
      productName: item.product?.name,
    });
  }

  return Object.values(grouped);
};