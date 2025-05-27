import { DataSource } from 'typeorm';
import { Product } from './entities/Product';
import { Sale } from './entities/Sale';
import { SaleItem } from './entities/SaleItem';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'data/magasin.db',
  entities: [Product, Sale, SaleItem],
  synchronize: true,
});