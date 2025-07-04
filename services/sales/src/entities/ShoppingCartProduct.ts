import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { ShoppingCart } from './ShoppingCart';

@Entity()
export class ShoppingCartProduct {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('int')
    product_id!: number;

    @ManyToOne(() => ShoppingCart, cart => cart.products)
    cart!: ShoppingCart;

    @Column('int')
    quantity!: number;
}