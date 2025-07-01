import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from './Product';
/* TODO add relation to Store */

@Entity()
export class SupplyRequest {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Product, { nullable: false })
    product!: Product;

    @Column()
    quantity!: number;
}