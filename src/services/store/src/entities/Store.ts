import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
/* TODO add relations to Inventory, Product, Sale */

@Entity()
export class Store {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ default: false })
  isMain!: boolean;
}