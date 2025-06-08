import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Product } from './Product';
import { Store } from './Store';

@Entity()
export class Inventory {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Store, store => store.storeProducts)
    store!: Store;

    @ManyToOne(() => Product, product => product.storeProducts)
    product!: Product;

    @Column()
    stock!: number;
}