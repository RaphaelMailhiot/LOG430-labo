import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ShoppingCartProduct } from './ShoppingCartProduct';

@Entity()
export class ShoppingCart {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'int', nullable: true })
    customer_id: number | null = null;

    @OneToMany(() => ShoppingCartProduct, product => product.cart, {
        cascade: true,
        eager: true,
    })
    products!: ShoppingCartProduct[];

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
