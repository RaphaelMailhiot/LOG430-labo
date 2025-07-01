import {Entity, PrimaryGeneratedColumn, ManyToOne, Column} from 'typeorm';
/* TODO add relation to Customer */
import { ShoppingCart } from './ShoppingCart';

@Entity()
export class Checkout {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => ShoppingCart, { eager: true })
    shoppingCart!: ShoppingCart;

    @Column('int', { default: 0 })
    totalAmount!: number;

    @Column('varchar')
    paymentMethod!: string;
}