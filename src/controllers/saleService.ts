// src/controllers/SaleService.ts
import { DataSource, Repository } from "typeorm";
import { Sale } from "../entity/Sale";
import { SaleProduct } from "../entity/SaleProduct";
import { Product } from "../entity/Product";

export class SaleService {
  private saleRepo: Repository<Sale>;
  private productRepo: Repository<Product>;
  private productSaleRepo: Repository<SaleProduct>;
  private dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
    this.saleRepo = dataSource.getRepository(Sale);
    this.productRepo = dataSource.getRepository(Product);
    this.productSaleRepo = dataSource.getRepository(SaleProduct);
  }

  /** Recherche de produit par ID, nom ou catégorie */
  async findProductBy(criteria: {
    id?: number;
    name?: string;
    category?: string;
  }): Promise<Product[]> {
    return this.productRepo.find({ where: criteria });
  }

  /** Crée une vente atomique (ACID) et met à jour le stock */
  async createSale(
    items: { productId: number; quantity: number }[]
  ): Promise<{ saleId: number; total: number }> {
    return this.dataSource.transaction(async (tx) => {
      const sale = tx.create(Sale, {});
      await tx.save(sale);

      let total = 0;
      for (const { productId, quantity } of items) {
        const prod = await tx.findOne(Product, { where: { id: productId } });
        if (!prod || prod.stock < quantity) {
          throw new Error(`Stock insuffisant pour le produit ${productId}`);
        }
        prod.stock -= quantity;
        await tx.save(prod);

        const line = tx.create(SaleProduct, {
          sale,
          product: prod,
          quantity,
          unitPrice: prod.price,
        });
        await tx.save(line);

        total += prod.price * quantity;
      }

      return { saleId: sale.id, total };
    });
  }

  /** Annule une vente et restaure le stock dans la même transaction */
  async cancelSale(saleId: number): Promise<void> {
    return this.dataSource.transaction(async (tx) => {
      const sale = await tx.findOne(Sale, {
        where: { id: saleId },
        relations: ["items", "items.product"],
      });
      if (!sale) {
        throw new Error(`Vente introuvable : ${saleId}`);
      }

      // Pour chaque ligne, restaurer le stock
      for (const line of sale.items) {
        const prod = line.product;
        prod.stock += line.quantity;
        await tx.save(prod);
      }

      // Suppression en cascade grâce à onDelete + cascade config
      await tx.remove(sale);
    });
  }

  /** Retourne l’état du stock pour tous les produits */
  async getStockStatus(): Promise<Product[]> {
    return this.productRepo.find();
  }
}
