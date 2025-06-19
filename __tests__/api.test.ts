import request from 'supertest';
import { app } from '../src/server';
import { AppDataSource } from '../src/data-source';
import Redis from 'ioredis';


beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
});

afterAll(async () => {
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }
    await redis.quit();
});

const redis = new Redis({ host: 'redis' });
const API_STATIC_TOKEN = process.env.API_STATIC_TOKEN || 'api-static-token';

//API Tests
describe('API /api/v2', () => {
    //Products API Tests
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

    // Sales API Tests
    it('GET /api/v2/sales retourne 200 et une liste de ventes', async () => {
        const res = await request(app)
            .get('/api/v2/sales')
            .set('Authorization', `Bearer ${API_STATIC_TOKEN}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data) || Array.isArray(res.body)).toBe(true);
    });
    it('GET /api/v2/sales sans token retourne 401', async () => {
        const res = await request(app)
            .get('/api/v2/sales');

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('message');
    });
    it('GET /api/v2/sales/:id retourne 200 ou 404', async () => {
        // On suppose qu'il existe au moins une vente avec l'id 1
        const res = await request(app)
            .get('/api/v2/sales/1')
            .set('Authorization', `Bearer ${API_STATIC_TOKEN}`);

        expect([200, 404]).toContain(res.status);
        if (res.status === 200) {
            expect(res.body).toHaveProperty('id');
        }
    });

    // Stores API Tests
    it('GET /api/v2/stores retourne 200 et une liste de magasins', async () => {
        const res = await request(app)
            .get('/api/v2/stores')
            .set('Authorization', `Bearer ${API_STATIC_TOKEN}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data) || Array.isArray(res.body)).toBe(true);
    });
    it('GET /api/v2/stores sans token retourne 401', async () => {
        const res = await request(app)
            .get('/api/v2/stores');

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('message');
    });
});