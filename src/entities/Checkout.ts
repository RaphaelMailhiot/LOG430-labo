import {Entity, PrimaryGeneratedColumn, ManyToOne, Column} from 'typeorm';
import { Customer } from './Customer';
import { ShoppingCart } from './ShoppingCart';

@Entity()
export class Checkout {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Customer, { eager: true })
    customer!: Customer;

    @ManyToOne(() => ShoppingCart, { eager: true })
    shoppingCart!: ShoppingCart;

    @Column('int', { default: 0 })
    totalAmount!: number;

    @Column('varchar')
    paymentMethod!: string;
}