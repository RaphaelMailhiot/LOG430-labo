import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from 'typeorm';
import { InventoryProduct } from './InventoryProduct';

@Entity()
export class SupplyRequest {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    store_id!: number;

    @ManyToOne(() => InventoryProduct, { nullable: false })
    @JoinColumn({ name: 'product_id' })
    product!: InventoryProduct;

    @Column()
    quantity!: number;
}