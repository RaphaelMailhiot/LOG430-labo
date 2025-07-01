import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Product } from './Product';
import { ShoppingCart } from './ShoppingCart';

@Entity()
export class ShoppingCartProduct {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => ShoppingCart, cart => cart.products)
    cart!: ShoppingCart;

    @ManyToOne(() => Product, { eager: true })
    product!: Product;

    @Column('int')
    quantity!: number;
}