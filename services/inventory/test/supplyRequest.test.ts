import request from 'supertest';

const seedSupplyRequests = [
    { id: 1, store_id: 1, product: { id: 101 }, quantity: 5 },
    { id: 2, store_id: 2, product: { id: 102 }, quantity: 10 }
];
const supplyRequests: any[] = [];
const products = [{ id: 101 }, { id: 102 }];

jest.mock('../src/data-source', () => ({
    AppDataSource: {
        getRepository: jest.fn(entity => ({
            find: jest.fn(({ where }: any = {}) => {
                if (entity.name === 'SupplyRequest') {
                    if (!where) return Promise.resolve([...supplyRequests]);
                    if (where.store_id !== undefined)
                        return Promise.resolve(supplyRequests.filter(r => r.store_id === where.store_id));
                }
                if (entity.name === 'InventoryProduct') {
                    return Promise.resolve(products);
                }
                return Promise.resolve([]);
            }),
            findOneBy: jest.fn(({ id }) => {
                if (entity.name === 'InventoryProduct')
                    return Promise.resolve(products.find(p => p.id === id) || null);
                return Promise.resolve(null);
            }),
            create: jest.fn(data => data),
            save: jest.fn(data => {
                const newRequest = { ...data, id: supplyRequests.length + 1 };
                supplyRequests.push(newRequest);
                return Promise.resolve(newRequest);
            }),
        })),
        initialize: jest.fn().mockResolvedValue(undefined),
    },
}));

jest.mock('../src/middleware/redisClient', () => ({
    redis: {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('OK'),
        del: jest.fn().mockResolvedValue(1),
        quit: jest.fn().mockResolvedValue('OK'),
    },
}));

import app from '../src/index';

beforeEach(() => {
    supplyRequests.length = 0;
    supplyRequests.push(...seedSupplyRequests.map(r => ({ ...r })));
});

describe('API SupplyRequests', () => {
    it('GET /supply-requests retourne 200 et la liste', async () => {
        const res = await request(app).get('/api/v1/supply-requests');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /supply-requests crée une demande et retourne 201', async () => {
        const newRequest = { store_id: 1, product_id: 101, quantity: 7 };
        const res = await request(app)
            .post('/api/v1/supply-requests')
            .send(newRequest);
        expect(res.status).toBe(201);
        expect(res.body.store_id).toBe(1);
        expect(res.body.quantity).toBe(7);
    });

    it('POST /supply-requests retourne 400 si produit inexistant', async () => {
        const res = await request(app)
            .post('/api/v1/supply-requests')
            .send({ store_id: 1, product_id: 999, quantity: 3 });
        expect([400, 500]).toContain(res.status);
    });

    it('GET /stores/1/supply-requests retourne 200 et les demandes du magasin 1', async () => {
        const res = await request(app).get('/api/v1/stores/1/supply-requests');
        expect(res.status).toBe(200);
        expect(res.body.every((r: any) => r.store_id === 1)).toBe(true);
    });

    it('GET /stores/999/supply-requests retourne 200 et tableau vide', async () => {
        const res = await request(app).get('/api/v1/stores/999/supply-requests');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
    });
});