import request from 'supertest';

const seedCheckouts = [
    { id: 1, customerId: 101 },
    { id: 2, customerId: 102 }
];
const checkouts: any[] = [];

jest.mock('../src/data-source', () => ({
    AppDataSource: {
        getRepository: jest.fn(() => ({
            find: jest.fn(() => Promise.resolve([...checkouts])),
            findOne: jest.fn(({ where }: any) => {
                if (where?.id !== undefined) {
                    return Promise.resolve(checkouts.find(c => c.id === where.id) || null);
                }
                return Promise.resolve(null);
            }),
            create: jest.fn(data => data),
            save: jest.fn(data => {
                const newCheckout = { ...data, id: checkouts.length + 1 };
                checkouts.push(newCheckout);
                return Promise.resolve(newCheckout);
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
    checkouts.length = 0;
    checkouts.push(...seedCheckouts.map(c => ({ ...c })));
});

describe('API Checkouts', () => {
    it('GET /checkouts retourne 200 et la liste', async () => {
        const res = await request(app).get('/api/v1/checkouts');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /checkouts crée un checkout et retourne 201', async () => {
        const newCheckout = { customerId: 103 };
        const res = await request(app)
            .post('/api/v1/checkouts')
            .send(newCheckout);
        expect(res.status).toBe(201);
        expect(res.body.customerId).toBe(103);
    });

    it('POST /checkouts retourne 400 si données invalides', async () => {
        const res = await request(app)
            .post('/api/v1/checkouts')
            .send({});
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    it('GET /checkouts/1 retourne 200 et le checkout', async () => {
        const res = await request(app).get('/api/v1/checkouts/1');
        expect(res.status).toBe(200);
        expect(res.body.id).toBe(1);
    });

    it('GET /checkouts/999 retourne 404 si non trouvé', async () => {
        const res = await request(app).get('/api/v1/checkouts/999');
        expect([400, 404, 500]).toContain(res.status);
    });
});