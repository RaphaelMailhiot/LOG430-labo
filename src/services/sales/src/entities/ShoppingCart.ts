import {Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn} from 'typeorm';
import {ShoppingCartProduct} from './ShoppingCartProduct';

@Entity()
export class ShoppingCart {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    customer_id!: number;

    @OneToMany(() => ShoppingCartProduct, product => product.cart, {cascade: true, eager: true})
    products!: ShoppingCartProduct[];

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}