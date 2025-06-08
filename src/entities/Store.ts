import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique } from 'typeorm';
import { Inventory } from './Inventory';
import { Product } from './Product';
import { Sale } from './Sale';

@Entity()
//@Unique(['isMain'])
export class Store {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ default: false })
  isMain!: boolean;

  @OneToMany(() => Product, product => product.store)
  products!: Product[];

  @OneToMany(() => Sale, sale => sale.store)
  sales!: Sale[];

  @OneToMany(() => Inventory, inventory => inventory.store)
  storeProducts!: Inventory[];
}