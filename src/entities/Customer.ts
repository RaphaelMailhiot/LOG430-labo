import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ShoppingCart } from './ShoppingCart';

@Entity()
export class Customer {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    email!: string;

    @OneToMany(() => ShoppingCart, cart => cart.customer)
    shoppingCarts!: ShoppingCart[];
}