import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { InventoryProduct } from './InventoryProduct';

@Entity()
export class SupplyRequest {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    store_id!: number;

    @ManyToOne(() => InventoryProduct, { nullable: false })
    product!: InventoryProduct;

    @Column()
    quantity!: number;
}