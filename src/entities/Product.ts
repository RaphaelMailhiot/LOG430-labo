import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Inventory } from './Inventory';
import { Store } from './Store';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  category!: string;

  @Column('real')
  price!: number;

  @Column('int', { default: 0 })
  stock!: number;

  @ManyToOne(() => Store, store => store.products)
  store!: Store;

  @OneToMany(() => Inventory, inventory => inventory.product)
  storeProducts!: Inventory[];
}