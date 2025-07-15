// Mock redisClient BEFORE any imports to prevent real Redis connection
jest.mock('../src/middleware/redisClient', () => ({
    redis: {
        get: jest.fn(() => null),
        set: jest.fn(),
        del: jest.fn(),
        quit: jest.fn(),
    },
}));

import { StoresController } from '../src/controllers/storesController';

jest.mock('../src/data-source', () => ({
    AppDataSource: {
        getRepository: jest.fn(() => ({
            find: jest.fn(() => Promise.resolve([{ id: 1, name: 'Main Store' }])),
            findOne: jest.fn(() => Promise.resolve({ id: 1, name: 'Main Store', isMain: true })),
            findOneBy: jest.fn(({ id }) => Promise.resolve(id === 1 ? { id: 1, name: 'Main Store' } : null)),
        })),
    },
}));

describe('StoresController', () => {
    const controller = new StoresController();

    it('getAllStores retourne la liste des magasins', async () => {
        const stores = await controller.getAllStores();
        expect(Array.isArray(stores)).toBe(true);
        expect(stores[0]).toHaveProperty('id');
    });

    it('getMainStore retourne le magasin principal', async () => {
        const store = await controller.getMainStore();
        expect(store).toHaveProperty('isMain', true);
    });

    it('getStoreById retourne le magasin si l\'ID existe', async () => {
        const store = await controller.getStoreById(1);
        expect(store).toHaveProperty('id', 1);
    });

    it('getStoreById lance une erreur si l\'ID n\'existe pas', async () => {
        await expect(controller.getStoreById(999)).rejects.toThrow('Store with ID 999 not found');
    });
});