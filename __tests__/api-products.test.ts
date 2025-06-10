import request from 'supertest';
import { app } from '../src/server';
import { AppDataSource } from '../src/data-source';
import { initStores, initProducts } from '../src/initData';

beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    await initStores();
    await initProducts();
});

afterAll(async () => {
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }
});

const API_STATIC_TOKEN = process.env.API_STATIC_TOKEN || 'api-static-token';

describe('API /api/v2/products', () => {
    it('GET /api/v2/products retourne 200 et une liste de produits', async () => {
        const res = await request(app)
            .get('/api/v2/products')
            .set('Authorization', `Bearer ${API_STATIC_TOKEN}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data) || Array.isArray(res.body)).toBe(true);
    });

    it('GET /api/v2/products sans token retourne 401', async () => {
        const res = await request(app)
            .get('/api/v2/products');

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('message');
    });

    it('GET /api/v2/products?page=2&size=1 retourne une page paginée', async () => {
        const res = await request(app)
            .get('/api/v2/products?page=2&size=1')
            .set('Authorization', `Bearer ${API_STATIC_TOKEN}`);

        expect(res.status).toBe(200);
        // Vérifie la pagination si présente
        if (res.body.pagination) {
            expect(res.body.pagination).toHaveProperty('current_page', 2);
            expect(res.body.pagination).toHaveProperty('total_pages');
        }
    });
});