import {DataSource} from 'typeorm';
import {Product} from './entities/Product';
import {Category} from './entities/Category';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Product, Category],
    synchronize: true,
    dropSchema: process.env.NODE_ENV === 'test',
});