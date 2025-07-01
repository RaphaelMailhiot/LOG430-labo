import { DataSource } from 'typeorm';
import { Customer } from './entities/Customer';
import { Manager } from './entities/Manager';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Customer, Manager],
    synchronize: true,
    dropSchema: process.env.NODE_ENV === 'test',
});