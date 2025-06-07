import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
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
}