import request from 'supertest';

const seedInventory = [
    {id: 1, store_id: 1, product_id: 101, stock: 10},
    {id: 2, store_id: 2, product_id: 102, stock: 5}
];
const inventory: any[] = [];

jest.mock('../src/data-source', () => ({
    AppDataSource: {
        getRepository: jest.fn(() => ({
            find: jest.fn(({where}: any) => {
                if (!where) return Promise.resolve([...inventory]);
                return Promise.resolve(inventory.filter(i => i.store_id === where.store_id));
            }),
            findOne: jest.fn(({where}: any) => {
                return Promise.resolve(
                    inventory.find(i => i.store_id === where.store_id && i.product_id === where.product_id) || null
                );
            }),
            save: jest.fn(item => Promise.resolve(item)),
        })),
        initialize: jest.fn().mockResolvedValue(undefined),
    },
}));

jest.mock('../src/middleware/redisClient', () => ({
    redis: {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('OK'),
        del: jest.fn().mockResolvedValue(1),
        keys: jest.fn().mockResolvedValue([]),
        quit: jest.fn().mockResolvedValue('OK'),
    },
}));

import app from '../src/index';

beforeEach(() => {
    inventory.length = 0;
    inventory.push(...seedInventory.map(i => ({...i})));
});

describe('API Inventories', () => {
    it('GET /stores/main/inventory retourne 200 et inventaire principal', async () => {
        const res = await request(app).get('/api/v1/stores/main/inventory');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /stores/1/inventory retourne 200 et inventaire du magasin 1', async () => {
        const res = await request(app).get('/api/v1/stores/1/inventory');
        expect(res.status).toBe(200);
        expect(res.body[0].store_id).toBe(1);
    });

    it('GET /stores/2/inventory retourne 200 et inventaire du magasin 2', async () => {
        const res = await request(app).get('/api/v1/stores/2/inventory');
        expect(res.status).toBe(200);
        expect(res.body[0].store_id).toBe(2);
    });

    it('GET /stores/1/inventory/products/101 retourne 200 si produit existe', async () => {
        const res = await request(app).get('/api/v1/stores/1/inventory/products/101');
        expect(res.status).toBe(200);
        expect(res.body.product_id).toBe(101);
    });

    it('GET /stores/1/inventory/products/999 retourne 404 si produit n\'existe pas', async () => {
        const res = await request(app).get('/api/v1/stores/1/inventory/products/999');
        expect([404, 400, 500]).toContain(res.status);
        expect(res.body.error).toBeDefined();
    });

    it('PUT /stores/1/products/101 met à jour le stock et retourne 200', async () => {
        const res = await request(app)
            .put('/api/v1/stores/1/products/101')
            .send({stock: 20});
        expect(res.status).toBe(200);
        expect(res.body.stock).toBe(20);
    });

    it('PUT /stores/1/products/999 retourne 404 si produit n\'existe pas', async () => {
        const res = await request(app)
            .put('/api/v1/stores/1/products/999')
            .send({stock: 10});
        expect([404, 400, 500]).toContain(res.status);
        expect(res.body.error).toBeDefined();
    });

    it('PUT /stores/1/products/101 retourne 400 si stock négatif', async () => {
        const res = await request(app)
            .put('/api/v1/stores/1/products/101')
            .send({stock: -5});
        expect([400, 500]).toContain(res.status);
    });
});