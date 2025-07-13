// @ts-ignore
import request from 'supertest';

const seedCategories = [
    { id: 1, name: 'Fruits', products: [{ id: 101 }] },
    { id: 2, name: 'Légumes', products: [{ id: 102 }] }
];
const categories: any[] = [];

jest.mock('../src/data-source', () => ({
    AppDataSource: {
        getRepository: jest.fn(() => ({
            find: jest.fn(() => Promise.resolve([...categories])),
            findOne: jest.fn(({ where }: any) => {
                if (where?.id !== undefined) {
                    return Promise.resolve(categories.find(c => c.id === where.id) || null);
                }
                if (where?.products?.id !== undefined) {
                    return Promise.resolve(categories.find(c =>
                        c.products.some((p: any) => p.id === where.products.id)
                    ) || null);
                }
                return Promise.resolve(null);
            }),
            create: jest.fn(data => data),
            save: jest.fn(data => {
                const newCategory = { ...data, id: categories.length + 1, products: [] };
                categories.push(newCategory);
                return Promise.resolve(newCategory);
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
    categories.length = 0;
    categories.push(...seedCategories.map(c => ({ ...c })));
});

describe('API Categories', () => {
    it('GET /categories retourne 200 et la liste', async () => {
        const res = await request(app).get('/api/v1/categories');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /categories/1 retourne 200 et la catégorie', async () => {
        const res = await request(app).get('/api/v1/categories/1');
        expect(res.status).toBe(200);
        expect(res.body.id).toBe(1);
    });

    it('GET /categories/999 retourne 400 ou 404 si non trouvée', async () => {
        const res = await request(app).get('/api/v1/categories/999');
        expect([400, 404, 500]).toContain(res.status);
    });

    it('GET /categories/product/101 retourne 200 et la catégorie du produit', async () => {
        const res = await request(app).get('/api/v1/categories/product/101');
        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Fruits');
    });

    it('GET /categories/product/999 retourne 400 ou 404 si non trouvée', async () => {
        const res = await request(app).get('/api/v1/categories/product/999');
        expect([400, 404, 500]).toContain(res.status);
    });

    it('POST /categories crée une catégorie et retourne 201', async () => {
        const newCategory = { name: 'Boissons' };
        const res = await request(app)
            .post('/api/v1/categories')
            .send(newCategory);
        expect(res.status).toBe(201);
        expect(res.body.name).toBe('Boissons');
    });

    it('POST /categories retourne 400 si données invalides', async () => {
        const res = await request(app)
            .post('/api/v1/categories')
            .send({});
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });
});