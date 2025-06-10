import { AppDataSource } from '../data-source';
import { Store } from '../entities/Store';

export class StoresController {
    async getAllStores() {
        const storeRepo = AppDataSource.getRepository(Store);
        return await storeRepo.find();
    }

    async getMainStore(): Promise<Store> {
        const storeRepo = AppDataSource.getRepository(Store);
        const mainStore = await storeRepo.findOne({ where: { isMain: true } });

        if (!mainStore) {
            throw new Error('Magasin principal non trouvé');
        }

        return mainStore;
    }

    async getStoreById(storeId: number) {
        const storeRepo = AppDataSource.getRepository(Store);
        const store = await storeRepo.findOneBy({ id: storeId });

        if (!store) {
            throw new Error(`Store with ID ${storeId} not found`);
        }

        return store;
    }
}