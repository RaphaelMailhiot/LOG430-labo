import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Sale } from './Sale';

@Entity()
export class SaleItem {
  @PrimaryColumn()
  sale_id!: number;

  @PrimaryColumn()
  product_id!: number;

  @Column('int')
  quantity!: number;

  @Column('real')
  price!: number;

  @ManyToOne(() => Sale, sale => sale.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sale_id' })
  sale!: Sale;
}