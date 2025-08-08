import Redis from 'ioredis';
import { logger } from './logger';

const redisConfig = {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    keepAlive: 30000,
    connectTimeout: 10000,
    commandTimeout: 5000,
};

export const redis = new Redis(redisConfig);

redis.on('connect', () => {
    logger.info('✅ Connecté à Redis');
});

redis.on('error', (error) => {
    logger.error('❌ Erreur Redis:', error);
});

redis.on('close', () => {
    logger.warn('⚠️ Connexion Redis fermée');
});

redis.on('reconnecting', () => {
    logger.info('🔄 Reconnexion à Redis...');
});

// Fonctions utilitaires pour le cache
export const cacheSaga = async (key: string, data: any, ttl: number = 300): Promise<void> => {
    try {
        await redis.setex(key, ttl, JSON.stringify(data));
        logger.debug(`Saga mise en cache: ${key}`);
    } catch (error) {
        logger.error(`Erreur lors de la mise en cache de la saga: ${error}`);
    }
};

export const getCachedSaga = async (key: string): Promise<any | null> => {
    try {
        const data = await redis.get(key);
        if (data) {
            logger.debug(`Saga récupérée du cache: ${key}`);
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        logger.error(`Erreur lors de la récupération du cache: ${error}`);
        return null;
    }
};

export const invalidateSagaCache = async (key: string): Promise<void> => {
    try {
        await redis.del(key);
        logger.debug(`Cache invalidé: ${key}`);
    } catch (error) {
        logger.error(`Erreur lors de l'invalidation du cache: ${error}`);
    }
};

export const setSagaLock = async (sagaId: string, ttl: number = 30): Promise<boolean> => {
    try {
        const lockKey = `saga_lock:${sagaId}`;
        const result = await redis.set(lockKey, 'locked', 'EX', ttl, 'NX');
        return result === 'OK';
    } catch (error) {
        logger.error(`Erreur lors de la pose du verrou: ${error}`);
        return false;
    }
};

export const releaseSagaLock = async (sagaId: string): Promise<void> => {
    try {
        const lockKey = `saga_lock:${sagaId}`;
        await redis.del(lockKey);
        logger.debug(`Verrou libéré: ${sagaId}`);
    } catch (error) {
        logger.error(`Erreur lors de la libération du verrou: ${error}`);
    }
}; 