import { redis } from '../redisClient';
import { AppDataSource } from '../data-source';
import { Store } from '../entities/Store';

export class StoresController {
    async getAllStores() {
        const cacheKey = 'stores:all';
        let cached: string | null = null;
        try {
            cached = await redis.get(cacheKey);
        } catch (err) {
            console.error('Erreur Redis (getAllStores):', err);
        }

        if (cached) {
            return JSON.parse(cached);
        }

        const storeRepo = AppDataSource.getRepository(Store);
        const stores = await storeRepo.find();
        try {
            await redis.set(cacheKey, JSON.stringify(stores), 'EX', 3600);
        } catch (err) {
            console.error('Erreur Redis (set getAllStores):', err);
        }

        return stores;
    }

    async getMainStore(): Promise<Store> {
        const cacheKey = 'stores:main';
        let cached: string | null = null;
        try {
            cached = await redis.get(cacheKey);
        } catch (err) {
            console.error('Erreur Redis (getMainStore):', err);
        }

        if (cached) {
            return JSON.parse(cached);
        }

        const storeRepo = AppDataSource.getRepository(Store);
        const mainStore = await storeRepo.findOne({ where: { isMain: true } });

        if (!mainStore) {
            throw new Error('Magasin principal non trouvé');
        }

        try {
            await redis.set(cacheKey, JSON.stringify(mainStore), 'EX', 3600);
        } catch (err) {
            console.error('Erreur Redis (set getMainStore):', err);
        }

        return mainStore;
    }

    async getStoreById(storeId: number) {
        const cacheKey = `stores:${storeId}`;
        let cached: string | null = null;
        try {
            cached = await redis.get(cacheKey);
        } catch (err) {
            console.error('Erreur Redis (getStoreById):', err);
        }

        if (cached) {
            return JSON.parse(cached);
        }

        const storeRepo = AppDataSource.getRepository(Store);
        const store = await storeRepo.findOneBy({ id: storeId });

        if (!store) {
            throw new Error(`Store with ID ${storeId} not found`);
        }

        try {
            await redis.set(cacheKey, JSON.stringify(store), 'EX', 3600);
        } catch (err) {
            console.error('Erreur Redis (set getStoreById):', err);
        }

        return store;
    }
}