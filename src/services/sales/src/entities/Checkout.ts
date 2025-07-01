import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@Entity()
export class Checkout {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    customer_id!: number;

    @Column()
    store_id!: number;

    @Column('int', {default: 0})
    total_amount!: number;

    @Column('varchar')
    payment_method!: string;
}