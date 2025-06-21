import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Customer } from './Customer';
import { ShoppingCartProduct } from './ShoppingCartProduct';

@Entity()
export class ShoppingCart {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Customer, customer => customer.shoppingCarts, { eager: true })
    customer!: Customer;

    @OneToMany(() => ShoppingCartProduct, product => product.cart, { cascade: true, eager: true })
    products!: ShoppingCartProduct[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}