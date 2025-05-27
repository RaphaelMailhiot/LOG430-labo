import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SaleItem } from './SaleItem';

@Entity()
export class Sale {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  date!: string;

  @OneToMany(() => SaleItem, item => item.sale)
  items!: SaleItem[];
}