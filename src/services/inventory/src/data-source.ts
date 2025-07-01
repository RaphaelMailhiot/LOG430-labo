import {DataSource} from 'typeorm';
import {InventoryProduct} from './entities/InventoryProduct';
import {SupplyRequest} from './entities/SupplyRequest';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [InventoryProduct, SupplyRequest],
    synchronize: true,
    dropSchema: process.env.NODE_ENV === 'test',
});