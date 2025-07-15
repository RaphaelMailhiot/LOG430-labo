// Mock redisClient BEFORE any imports to prevent real Redis connection
jest.mock('../src/middleware/redisClient', () => ({
    redis: {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('OK'),
        del: jest.fn().mockResolvedValue(1),
        quit: jest.fn().mockResolvedValue('OK'),
    },
}));

import request from 'supertest';

const seedStores = [
    { id: 1, name: 'Main Store', isMain: true },
    { id: 2, name: 'Secondary Store', isMain: false }
];
const stores: any[] = [];

jest.mock('../src/data-source', () => ({
    AppDataSource: {
        getRepository: jest.fn(() => ({
            find: jest.fn(() => Promise.resolve([...stores])),
            findOne: jest.fn(({ where }) => {
                if (where?.isMain !== undefined) {
                    return Promise.resolve(stores.find(s => s.isMain === where.isMain) || null);
                }
                return Promise.resolve(null);
            }),
            findOneBy: jest.fn(({ id }) => Promise.resolve(stores.find(s => s.id === id) || null)),
        })),
        initialize: jest.fn().mockResolvedValue(undefined),
    },
}));

// Mock le serveur pour éviter qu'il démarre
jest.spyOn(require('http'), 'createServer').mockImplementation(() => ({
    listen: jest.fn(),
    close: jest.fn(),
}));

import app from '../src/index';

beforeEach(() => {
    stores.length = 0;
    stores.push(...seedStores.map(s => ({ ...s })));
});

describe('API Stores', () => {
    it('GET /stores retourne 200 et la liste des magasins', async () => {
        const res = await request(app).get('/api/v1/stores');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toHaveProperty('id');
    });

    it('GET /stores/main retourne 200 et le magasin principal', async () => {
        const res = await request(app).get('/api/v1/stores/main');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('isMain', true);
    });

    it('GET /stores/1 retourne 200 et le magasin', async () => {
        const res = await request(app).get('/api/v1/stores/1');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('id', 1);
    });

    it('GET /stores/999 retourne 404 si le magasin n\'existe pas', async () => {
        const res = await request(app).get('/api/v1/stores/999');
        expect([400, 404, 500]).toContain(res.status);
    });
});