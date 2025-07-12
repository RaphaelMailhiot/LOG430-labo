import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class InventoryProduct {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    store_id!: number;

    @Column()
    product_id!: number;

    @Column()
    stock!: number;
}