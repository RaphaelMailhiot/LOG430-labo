// src/entity/Sale.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { SaleProduct } from "./SaleProduct";

@Entity({ name: "sale" })
export class Sale {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ type: "datetime" })
  createdAt!: Date;

  /**
   * Liaisons vers les lignes de vente.
   * Cascade permet de créer automatiquement
   * les ProductSale lors du save d’une Sale.
   */
  @OneToMany(() => SaleProduct, (ps) => ps.sale, {
    cascade: ["insert", "update"],
    eager: true,         // charge les lignes automatiquement
  })
  items!: SaleProduct[];
}
