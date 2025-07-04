import 'reflect-metadata';
import {DataSource} from 'typeorm';

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 3000;

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: false,
    entities: [`${__dirname}/entities/*.ts`],
    migrations: [`${__dirname}/migrations/*.ts`],
    subscribers: [],
});

export async function initializeDatabase(): Promise<void> {
    let retries = MAX_RETRIES;

    while (retries > 0) {
        try {
            await AppDataSource.initialize();
            console.log('✅ Base de données connectée avec succès.');
            return;
        } catch (error) {
            retries--;
            console.warn(`❌ Échec de la connexion. Nouvelle tentative dans ${RETRY_DELAY_MS / 1000}s... (${MAX_RETRIES - retries}/${MAX_RETRIES})`);
            if (retries === 0) {
                console.error('🚨 Impossible de se connecter à la base de données après plusieurs tentatives :', error);
                process.exit(1);
            }
            await new Promise(res => setTimeout(res, RETRY_DELAY_MS));
        }
    }
}