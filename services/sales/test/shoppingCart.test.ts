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

const seedCarts = [
    { id: 1, customer_id: 101, products: [] },
    { id: 2, customer_id: 102, products: [] }
];
const carts: any[] = [];

jest.mock('../src/data-source', () => ({
    AppDataSource: {
        getRepository: jest.fn(() => ({
            find: jest.fn(() => Promise.resolve([...carts])),
            findOne: jest.fn(({ where }) => Promise.resolve(carts.find(c => c.customer_id === where.customer_id) || null)),
            manager: {
                create: jest.fn((_, data) => ({
                    id: Math.floor(Math.random() * 10000),
                    product_id: data.product_id,
                    quantity: data.quantity,
                    cart: data.cart
                })),
            },
            save: jest.fn(cart => {
                const idx = carts.findIndex(c => c.id === cart.id);
                if (idx !== -1) {
                    carts[idx].products = cart.products;
                    return Promise.resolve(carts[idx]);
                }
                return Promise.resolve(cart);
            }),
        })),
        initialize: jest.fn().mockResolvedValue(undefined),
    },
}));

import app from '../src/index';

beforeEach(() => {
    carts.length = 0;
    carts.push(...seedCarts.map(c => ({ ...c })));
});

describe('API ShoppingCarts', () => {
    it('GET /shopping-carts retourne 200 et la liste', async () => {
        const res = await request(app).get('/api/v1/shopping-carts');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    //TODO Fix this test
    /*it('POST /shopping-carts/:productsId ajoute un produit au chariot', async () => {
        const res = await request(app)
            .post('/api/v1/shopping-carts/123')
            .send({ customerId: 101, quantity: 2 });
        expect(res.status).toBe(201);
        expect(Array.isArray(res.body.products)).toBe(true);
        expect(res.body.products.length).toBeGreaterThanOrEqual(1);
    });*/

    //TODO Fix this test
    /*it('POST /shopping-carts/:productsId retourne 400 si le chariot n\'existe pas', async () => {
        const res = await request(app)
            .post('/api/v1/shopping-carts/123')
            .send({ customerId: 999, quantity: 2 });
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });*/
});