// src/entity/SaleProduct.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Sale } from "./Sale";
import { Product } from "./Product";

@Entity({ name: "sale_product" })
export class SaleProduct {
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * Référence à la vente parente
   */
  @ManyToOne(() => Sale, (sale) => sale.items, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "sale_id" })
  sale!: Sale;

  /**
   * Référence au produit vendu
   */
  @ManyToOne(() => Product, {
    eager: true,        // charge les infos produit automatiquement
  })
  @JoinColumn({ name: "product_id" })
  product!: Product;

  /** Quantité vendue de ce produit */
  @Column({ type: "integer" })
  quantity!: number;

  /** Prix unitaire au moment de la vente */
  @Column({ type: "decimal", precision: 10, scale: 2 })
  unitPrice!: number;
}
