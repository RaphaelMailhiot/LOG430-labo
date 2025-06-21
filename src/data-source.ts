import { DataSource } from 'typeorm';
import { Customer } from './entities/Customer';
import { Inventory } from './entities/Inventory';
import { Product } from './entities/Product';
import { Sale } from './entities/Sale';
import { SaleItem } from './entities/SaleItem';
import { Store } from './entities/Store';
import { SupplyRequest } from './entities/SupplyRequest';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  username: process.env.DB_USER || 'labuser',
  password: process.env.DB_PASSWORD || 'labpassword',
  database: process.env.DB_NAME || 'labdb',
  entities: [Customer, Inventory, Product, Sale, SaleItem, Store, SupplyRequest],
  synchronize: true,
  dropSchema: process.env.NODE_ENV === 'test',
});