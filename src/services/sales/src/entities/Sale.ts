import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { SaleItem } from './SaleItem';
/* TODO add relation to Store */

@Entity()
export class Sale {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date!: string;

  @OneToMany(() => SaleItem, item => item.sale)
  items!: SaleItem[];
}