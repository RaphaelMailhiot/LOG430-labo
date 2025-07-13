// @ts-ignore
import request from 'supertest';

interface Manager {
    id: number;
    name: string;
    email: string;
    password: string;
    store_id: number;
}

const seedManagers: Manager[] = [
    { id: 1, name: 'Jean', email: 'jean@example.com', password: 'pass1', store_id: 101 },
    { id: 2, name: 'Marie', email: 'marie@example.com', password: 'pass2', store_id: 102 }
];
const managers: Manager[] = [];
let idCounter = 1;

jest.mock('../src/data-source', () => ({
    AppDataSource: {
        getRepository: jest.fn(() => ({
            find: jest.fn(() => Promise.resolve([...managers])),
            create: jest.fn(data => data),
            save: jest.fn(data => {
                const newManager: Manager = { ...data, id: idCounter++ };
                managers.push(newManager);
                return Promise.resolve(newManager);
            }),
            findOne: jest.fn(({ where }) => {
                const found = managers.find(m => m.id === where.id);
                return Promise.resolve(found || null);
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
    managers.length = 0;
    managers.push(...seedManagers.map(m => ({ ...m })));
    idCounter = managers.length + 1;
});

describe('API Managers', () => {
    it('GET /managers retourne 200', async () => {
        const res = await request(app).get('/api/v1/managers');
        expect(res.status).toBe(200);
    });

    it('POST /managers crée un manager et retourne 201', async () => {
        const newManager = { name: 'Test', email: 'test@example.com', password: 'pass', store_id: 103 };
        const res = await request(app)
            .post('/api/v1/managers')
            .send(newManager);
        expect(res.status).toBe(201);
    });

    it('GET /managers/:managerId retourne 200 si le manager existe', async () => {
        await request(app)
            .post('/api/v1/managers')
            .send({ name: 'Test2', email: 'test2@example.com', password: 'pass2', store_id: 104 });
        const id = 3;
        const getRes = await request(app).get(`/api/v1/managers/${id}`);
        expect(getRes.status).toBe(200);
    });

    it('GET /managers/:managerId retourne 400, 404 ou 500 si le manager n\'existe pas', async () => {
        const res = await request(app).get('/api/v1/managers/999999');
        expect([404, 400, 500]).toContain(res.status);
    });
});