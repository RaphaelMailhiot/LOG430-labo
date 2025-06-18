import Redis from 'ioredis';
import { AppDataSource } from '../data-source';
import { Store } from '../entities/Store';

const redis = new Redis({ host: 'redis' });

export class StoresController {
    async getAllStores() {
        const cacheKey = 'stores:all';
        const cached = await redis.get(cacheKey);

        if (cached) {
            return JSON.parse(cached);
        }

        const storeRepo = AppDataSource.getRepository(Store);
        const stores = await storeRepo.find();
        await redis.set(cacheKey, JSON.stringify(stores), 'EX', 3600); // Cache for 1 hour

        return stores;
    }

    async getMainStore(): Promise<Store> {
        const cacheKey = 'stores:main';
        const cached = await redis.get(cacheKey);

        if (cached) {
            return JSON.parse(cached);
        }

        const storeRepo = AppDataSource.getRepository(Store);
        const mainStore = await storeRepo.findOne({ where: { isMain: true } });

        if (!mainStore) {
            throw new Error('Magasin principal non trouvé');
        }

        await redis.set(cacheKey, JSON.stringify(mainStore), 'EX', 3600);

        return mainStore;
    }

    async getStoreById(storeId: number) {
        const cacheKey = `stores:${storeId}`;
        const cached = await redis.get(cacheKey);

        if (cached) {
            return JSON.parse(cached);
        }

        const storeRepo = AppDataSource.getRepository(Store);
        const store = await storeRepo.findOneBy({ id: storeId });

        if (!store) {
            throw new Error(`Store with ID ${storeId} not found`);
        }

        await redis.set(cacheKey, JSON.stringify(store), 'EX', 3600);

        return store;
    }
}