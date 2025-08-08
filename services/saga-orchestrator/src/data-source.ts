import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Saga } from './entities/Saga';
import { SagaStep } from './entities/SagaStep';

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
    entities: [Saga, SagaStep],
    migrations: [`${__dirname}/migrations/*.ts`],
    subscribers: [],
    // Optimisations mémoire pour TypeORM
    extra: {
        // Limite le pool de connexions
        max: 5,
        min: 1,
        // Timeout pour les connexions
        connectionTimeoutMillis: 5000,
        // Timeout pour les requêtes
        query_timeout: 5000,
        // Timeout pour les statements
        statement_timeout: 5000,
        // Désactive les logs de requêtes en production
        application_name: process.env.NODE_ENV === 'production' ? undefined : 'saga-orchestrator',
    },
    // Optimisations supplémentaires
    cache: {
        duration: 30000, // 30 secondes
        type: 'redis',
        options: {
            host: process.env.REDIS_HOST || 'redis',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            ttl: 300, // 5 minutes
        },
    },
    // Désactive les logs en production
    logger: process.env.NODE_ENV === 'production' ? 'simple-console' : 'advanced-console',
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