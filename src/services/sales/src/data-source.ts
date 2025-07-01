import { DataSource } from 'typeorm';
import { Checkout } from './entities/Checkout';
import { Sale } from './entities/Sale';
import { SaleItem } from './entities/SaleItem';
import { ShoppingCart } from './entities/ShoppingCart';
import { ShoppingCartProduct } from './entities/ShoppingCartProduct';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Checkout, Sale, SaleItem, ShoppingCart, ShoppingCartProduct],
    synchronize: true,
    dropSchema: process.env.NODE_ENV === 'test',
});