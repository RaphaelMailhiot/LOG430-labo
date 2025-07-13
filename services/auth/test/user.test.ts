import request from 'supertest';

interface User {
    id: number;
    email: string;
    password: string;
    name: string;
}

const seedUsers: User[] = [
    { id: 1, email: 'alice@example.com', password: 'pass1', name: 'Alice' },
    { id: 2, email: 'bob@example.com', password: 'pass2', name: 'Bob' }
];
const users: User[] = [];

jest.mock('../src/data-source', () => ({
    AppDataSource: {
        getRepository: jest.fn(() => ({
            find: jest.fn(() => Promise.resolve([...users])),
            findOne: jest.fn(({ where }) => {
                const found = users.find(u => u.email === where.email && u.password === where.password);
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
    users.length = 0;
    users.push(...seedUsers.map(u => ({ ...u })));
});

describe('API Users', () => {
    it('GET /users retourne 200 et la liste des users', async () => {
        const res = await request(app).get('/api/v1/users');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /users/:userEmail/password/:userPassword retourne 200 si user existe', async () => {
        const res = await request(app).get('/api/v1/users/alice@example.com/password/pass1');
        expect(res.status).toBe(200);
        expect(res.body.email).toBe('alice@example.com');
    });

    it('GET /users/:userEmail/password/:userPassword retourne 404 ou 400 si user n\'existe pas', async () => {
        const res = await request(app).get('/api/v1/users/unknown@example.com/password/wrong');
        expect(res.body).toBe(false);
    });
});