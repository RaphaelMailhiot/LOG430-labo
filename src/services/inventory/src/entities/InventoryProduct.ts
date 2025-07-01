import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class InventoryProduct {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    storeId!: number;

    @Column()
    productId!: number;

    @Column()
    stock!: number;
}