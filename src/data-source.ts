import { DataSource } from 'typeorm';
import { Product } from './entities/Product';
import { Sale } from './entities/Sale';
import { SaleItem } from './entities/SaleItem';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'db',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'labuser',
  password: process.env.DB_PASSWORD || 'labpassword',
  database: process.env.DB_NAME || 'labdb',
  entities: [Product, Sale, SaleItem],
  synchronize: true,
});