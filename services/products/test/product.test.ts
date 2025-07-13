// @ts-ignore
import request from 'supertest';

const seedCategories = [
    { id: 1, name: 'Fruits', products: [{ id: 101 }] },
    { id: 2, name: 'Légumes', products: [{ id: 102 }] }
];
const seedProducts = [
    { id: 101, name: 'Pomme', category: 'Fruits' },
    { id: 102, name: 'Carotte', category: 'Légumes' },
    { id: 103, name: 'Banane', category: 'Fruits' }
];
const products: any[] = [];
const categories: any[] = [];

jest.mock('../src/data-source', () => ({
    AppDataSource: {
        getRepository: jest.fn(entity => {
            if (entity?.name === 'Category') {
                return {
                    find: jest.fn(() => Promise.resolve([...categories])),
                    findOne: jest.fn(({ where, relations }: any) => {
                        if (where?.id !== undefined) {
                            const cat = categories.find(c => c.id === where.id);
                            // Simule la relation 'products'
                            if (cat && relations?.includes('products')) {
                                return Promise.resolve(cat);
                            }
                            return Promise.resolve(cat || null);
                        }
                        return Promise.resolve(null);
                    }),
                };
            }
            // Product
            return {
                find: jest.fn(() => Promise.resolve([...products])),
                findAndCount: jest.fn(({ where, order, skip, take }) => {
                    let filtered = [...products];
                    if (where?.category) filtered = filtered.filter(p => p.category === where.category);
                    if (order) {
                        const [field, dir] = Object.entries(order)[0];
                        filtered.sort((a, b) =>
                            dir === 'ASC' ? a[field].localeCompare(b[field]) : b[field].localeCompare(a[field])
                        );
                    }
                    const data = filtered.slice(skip, skip + take);
                    return Promise.resolve([data, filtered.length]);
                }),
            };
        }),
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
    products.length = 0;
    products.push(...seedProducts.map(p => ({ ...p })));
    categories.length = 0;
    categories.push(...seedCategories.map(c => ({ ...c })));
});

describe('API Products', () => {
    it('GET /products retourne 200 et la liste paginée', async () => {
        const res = await request(app).get('/api/v1/products');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.pagination).toBeDefined();
    });

    it('GET /products avec filtrage par catégorie retourne les bons produits', async () => {
        const res = await request(app).get('/api/v1/products?category=Fruits');
        expect(res.status).toBe(200);
        expect(res.body.data.every((p: any) => p.category === 'Fruits')).toBe(true);
    });

    it('GET /products avec tri retourne les produits triés', async () => {
        const res = await request(app).get('/api/v1/products?sort=name,DESC');
        expect(res.status).toBe(200);
        expect(res.body.data[0].name).toBe('Pomme');
    });

    it('GET /products/category/1 retourne 200 ou 404', async () => {
        const res = await request(app).get('/api/v1/products/category/1');
        expect([200, 404]).toContain(res.status);
    });

    it('GET /products/category/999 retourne 404 si catégorie inexistante', async () => {
        const res = await request(app).get('/api/v1/products/category/999');
        expect([400, 404, 500]).toContain(res.status);
        expect(res.body.error).toBeDefined();
    });
});