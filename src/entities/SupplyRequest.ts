import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from './Product';
import { Store } from './Store';

@Entity()
export class SupplyRequest {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Store, { nullable: false })
    store!: Store;

    @ManyToOne(() => Product, { nullable: false })
    product!: Product;

    @Column()
    quantity!: number;
}