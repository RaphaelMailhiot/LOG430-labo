import request from 'supertest';
import { app } from '../src/server';
import { AppDataSource } from '../src/data-source';

const API_STATIC_TOKEN = process.env.API_STATIC_TOKEN || 'api-static-token';

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

describe('API /api/v2/stores', () => {
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

  it('GET /api/v2/stores/:id retourne 200 ou 404', async () => {
    // On suppose qu'il existe au moins un magasin avec l'id 1
    const res = await request(app)
      .get('/api/v2/stores/1')
      .set('Authorization', `Bearer ${API_STATIC_TOKEN}`);

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('id');
    }
  });
});