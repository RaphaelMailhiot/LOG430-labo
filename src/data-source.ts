import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Product } from './entity/Product';
import { Sale } from './entity/Sale';
import { SaleProduct } from './entity/SaleProduct';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DB_PATH || 'store.sqlite',
  synchronize: false,
  logging: false,
  entities: [Product, Sale, SaleProduct],
  migrations: ['src/migration/**/*.js'],
});