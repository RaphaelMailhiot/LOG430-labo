import { AppDataSource } from '../data-source';
import { Product } from '../entities/Product';
import { Sale } from '../entities/Sale';
import { SaleItem } from '../entities/SaleItem';

/**
 * Enregistre une vente et décale le stock.
 * @returns l’ID de la vente créée
 */
export const recordSale = async (
  items: { productId: number; quantity: number; price: number }[]
): Promise<number> => {
  const saleRepo = AppDataSource.getRepository(Sale);
  const saleItemRepo = AppDataSource.getRepository(SaleItem);
  const productRepo = AppDataSource.getRepository(Product);

  // Création de la vente
  const sale = new Sale();
  await saleRepo.save(sale);

  // Création des items et mise à jour du stock
  for (const it of items) {
    const product = await productRepo.findOneByOrFail({ id: it.productId });
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
 * Annule une vente et rétablit le stock.
 */
export const cancelSale = async (saleId: number): Promise<void> => {
  const saleItemRepo = AppDataSource.getRepository(SaleItem);
  const productRepo = AppDataSource.getRepository(Product);
  const saleRepo = AppDataSource.getRepository(Sale);

  const items = await saleItemRepo.find({ where: { sale_id: saleId } });

  for (const it of items) {
    const product = await productRepo.findOneByOrFail({ id: it.product_id });
    product.stock += it.quantity;
    await productRepo.save(product);
  }

  await saleItemRepo.delete({ sale_id: saleId });
  await saleRepo.delete({ id: saleId });
};

/**
 * Récupère toutes les ventes passées.
 */
export const findOldSales = async (): Promise<any[]> => {
  const saleItemRepo = AppDataSource.getRepository(SaleItem);
  const items = await saleItemRepo.find();

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