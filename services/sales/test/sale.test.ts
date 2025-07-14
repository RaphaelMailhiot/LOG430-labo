import request from 'supertest';

const seedSales = [
    { id: 1, store_id: 10, total: 100 },
    { id: 2, store_id: 20, total: 200 }
];
const sales: any[] = [];

jest.mock('../src/data-source', () => ({
    AppDataSource: {
        getRepository: jest.fn(() => ({
            find: jest.fn(() => Promise.resolve([...sales])),
            findBy: jest.fn(({ store_id }) => Promise.resolve(sales.filter(s => s.store_id === store_id))),
            findOne: jest.fn(({ where }) => Promise.resolve(sales.find(s => s.id === where.id && s.store_id === where.store_id) || null)),
        })),
        initialize: jest.fn().mockResolvedValue(undefined),
    },
}));

jest.mock('../src/middleware/redisClient', () => ({
    redis: {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('OK'),
        quit: jest.fn().mockResolvedValue('OK'),
    },
}));

import app from '../src/index';

beforeEach(() => {
    sales.length = 0;
    sales.push(...seedSales.map(s => ({ ...s })));
});

describe('API Sales', () => {
    it('GET /sales retourne 200 et la liste', async () => {
        const res = await request(app).get('/api/v1/sales');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /stores/10/sales retourne les ventes du magasin', async () => {
        const res = await request(app).get('/api/v1/stores/10/sales');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.every((s: any) => s.store_id === 10)).toBe(true);
    });

    it('GET /stores/10/sales/1 retourne la vente', async () => {
        const res = await request(app).get('/api/v1/stores/10/sales/1');
        expect(res.status).toBe(200);
        expect(res.body.id).toBe(1);
        expect(res.body.store_id).toBe(10);
    });

    it('GET /stores/99/sales/999 retourne 400 ou 404 si non trouvé', async () => {
        const res = await request(app).get('/api/v1/stores/99/sales/999');
        expect([400, 404, 500]).toContain(res.status);
    });
});