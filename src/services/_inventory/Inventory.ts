import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Product } from './Product';
/* TODO add relation to Store */

@Entity()
export class Inventory {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Product, product => product.storeProducts)
    product!: Product;

    @Column()
    stock!: number;
}