// @ts-ignore
import request from 'supertest';

interface Customer {
    id: number;
    name: string;
    email: string;
}

const seedCustomers: Customer[] = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' }
];
const customers: Customer[] = [];
let idCounter = 1;

jest.mock('../src/data-source', () => ({
    AppDataSource: {
        getRepository: jest.fn(() => ({
            find: jest.fn(() => Promise.resolve([...customers])),
            create: jest.fn(data => data),
            save: jest.fn(data => {
                const newCustomer: Customer = { ...data, id: idCounter++ };
                customers.push(newCustomer);
                return Promise.resolve(newCustomer);
            }),
            findOne: jest.fn(({ where }) => {
                const found = customers.find(c => c.id === where.id);
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
    customers.length = 0;
    customers.push(...seedCustomers.map(c => ({ ...c })));
    idCounter = customers.length + 1;
});

describe('API Customers', () => {
    it('GET /customers retourne 200', async () => {
        const res = await request(app).get('/api/v1/customers');
        expect(res.status).toBe(200);
    });

    it('POST /customers crée un client et retourne 201', async () => {
        const newCustomer = { name: 'Test', email: 'test@example.com' };
        const res = await request(app)
            .post('/api/v1/customers')
            .send(newCustomer);
        expect(res.status).toBe(201);
    });

    it('GET /customers/:customerId retourne 200 si le client existe', async () => {
        await request(app)
            .post('/api/v1/customers')
            .send({ name: 'Test2', email: 'test2@example.com' });
        const id = 3;
        const getRes = await request(app).get(`/api/v1/customers/${id}`);
        expect(getRes.status).toBe(200);
    });

    it('GET /customers/:customerId retourne 400, 404 ou 500 si le client n\'existe pas', async () => {
        const res = await request(app).get('/api/v1/customers/999999');
        expect([404, 400, 500]).toContain(res.status);
    });
});