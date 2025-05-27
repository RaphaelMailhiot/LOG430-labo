import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  category!: string;

  @Column('real')
  price!: number;

  @Column('int', { default: 0 })
  stock!: number;
}