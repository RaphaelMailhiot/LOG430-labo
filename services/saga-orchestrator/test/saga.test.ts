// Mock redisClient BEFORE any imports to prevent real Redis connection
jest.mock('../src/middleware/redisClient', () => ({
    redis: {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('OK'),
        del: jest.fn().mockResolvedValue(1),
        quit: jest.fn().mockResolvedValue('OK'),
    },
}));

// Mock logger pour éviter les logs pendant les tests
jest.mock('../src/middleware/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    },
}));

// Mock axios pour les appels HTTP
jest.mock('axios', () => ({
    get: jest.fn().mockResolvedValue({ data: { data: { id: 1, stock: 10 } } }),
    post: jest.fn().mockResolvedValue({ data: { payment_id: 'pay-123', transaction_id: 'tx-456', sale_id: 'sale-789' } }),
    patch: jest.fn().mockResolvedValue({ data: { success: true } }),
    delete: jest.fn().mockResolvedValue({ data: { success: true } }),
}));

// Mock les exécuteurs de saga
jest.mock('../src/services/executors/PurchaseSagaExecutor', () => ({
    PurchaseSagaExecutor: jest.fn().mockImplementation(() => ({
        executeStep: jest.fn().mockResolvedValue({ success: true }),
        compensateStep: jest.fn().mockResolvedValue(undefined),
        getNextStep: jest.fn().mockReturnValue(null),
        getCompensationStep: jest.fn().mockReturnValue({ type: 'compensation', status: 'pending' }),
    })),
}));

jest.mock('../src/services/executors/ReturnSagaExecutor', () => ({
    ReturnSagaExecutor: jest.fn().mockImplementation(() => ({
        executeStep: jest.fn().mockResolvedValue({ success: true }),
        compensateStep: jest.fn().mockResolvedValue(undefined),
        getNextStep: jest.fn().mockReturnValue(null),
        getCompensationStep: jest.fn().mockReturnValue({ type: 'compensation', status: 'pending' }),
    })),
}));

import request from 'supertest';

// Mock data
const seedSagas = [
    { 
        id: 'saga-1', 
        type: 'purchase_saga', 
        status: 'completed', 
        data: { store_id: 1, customer_id: 123 },
        created_at: new Date(),
        updated_at: new Date()
    },
    { 
        id: 'saga-2', 
        type: 'return_saga', 
        status: 'pending', 
        data: { sale_id: 789, customer_id: 123 },
        created_at: new Date(),
        updated_at: new Date()
    }
];

const sagas: any[] = [];
const sagaSteps: any[] = [];

// Mock data-source
jest.mock('../src/data-source', () => ({
    AppDataSource: {
        getRepository: jest.fn((entityName) => {
            if (entityName === 'Saga') {
                return {
                    find: jest.fn(() => Promise.resolve([...sagas])),
                    findOne: jest.fn(({ where, relations }) => {
                        const saga = sagas.find(s => s.id === where.id);
                        if (saga && relations && relations.includes('steps')) {
                            saga.steps = sagaSteps.filter(step => step.saga_id === saga.id);
                        }
                        return Promise.resolve(saga || null);
                    }),
                    save: jest.fn((saga) => {
                        if (!saga.id) {
                            saga.id = `saga-${Date.now()}`;
                        }
                        const existingIndex = sagas.findIndex(s => s.id === saga.id);
                        if (existingIndex >= 0) {
                            sagas[existingIndex] = { ...saga };
                        } else {
                            sagas.push({ ...saga });
                        }
                        return Promise.resolve(saga);
                    }),
                    create: jest.fn((data) => ({ ...data, id: `saga-${Date.now()}` })),
                    clear: jest.fn(() => {
                        sagas.length = 0;
                        return Promise.resolve();
                    }),
                };
            } else if (entityName === 'SagaStep') {
                return {
                    find: jest.fn(() => Promise.resolve([...sagaSteps])),
                    findOne: jest.fn(({ where }) => Promise.resolve(sagaSteps.find(s => s.id === where.id) || null)),
                    save: jest.fn((step) => {
                        if (!step.id) {
                            step.id = `step-${Date.now()}`;
                        }
                        const existingIndex = sagaSteps.findIndex(s => s.id === step.id);
                        if (existingIndex >= 0) {
                            sagaSteps[existingIndex] = { ...step };
                        } else {
                            sagaSteps.push({ ...step });
                        }
                        return Promise.resolve(step);
                    }),
                    create: jest.fn((data) => ({ ...data, id: `step-${Date.now()}` })),
                    clear: jest.fn(() => {
                        sagaSteps.length = 0;
                        return Promise.resolve();
                    }),
                };
            }
            return {};
        }),
        initialize: jest.fn().mockResolvedValue(undefined),
        destroy: jest.fn().mockResolvedValue(undefined),
    },
}));

import app from '../src/index';

beforeEach(() => {
    sagas.length = 0;
    sagaSteps.length = 0;
    sagas.push(...seedSagas.map(s => ({ ...s })));
});

afterAll(async () => {
    // Fermer proprement les connexions
    await new Promise(resolve => setTimeout(resolve, 100));
});

describe('Saga Orchestrator API', () => {
  describe('POST /api/v1/sagas', () => {
    it('devrait créer une nouvelle saga d\'achat', async () => {
      const sagaData = {
        type: 'purchase_saga',
        data: {
          store_id: 1,
          customer_id: 123,
          items: [
            { product_id: 456, quantity: 2, price: 29.99 }
          ],
          payment_method: 'credit_card',
          amount: 59.98
        }
      };

      const response = await request(app)
        .post('/api/v1/sagas')
        .send(sagaData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('saga');
      expect(response.body.saga.type).toBe('purchase_saga');
      expect(response.body.saga.status).toBe('pending');
    });

    it('devrait créer une nouvelle saga de retour', async () => {
      const sagaData = {
        type: 'return_saga',
        data: {
          sale_id: 789,
          customer_id: 123,
          items: [
            { product_id: 456, quantity: 1, reason: 'defective' }
          ],
          refund_amount: 29.99
        }
      };

      const response = await request(app)
        .post('/api/v1/sagas')
        .send(sagaData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('saga');
      expect(response.body.saga.type).toBe('return_saga');
      expect(response.body.saga.status).toBe('pending');
    });

    it('devrait rejeter une saga avec des données invalides', async () => {
      const invalidSagaData = {
        type: 'invalid_saga_type',
        data: {}
      };

      const response = await request(app)
        .post('/api/v1/sagas')
        .send(invalidSagaData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/sagas', () => {
    it('devrait retourner la liste des sagas', async () => {
      const response = await request(app)
        .get('/api/v1/sagas')
        .expect(200);

      expect(response.body).toHaveProperty('sagas');
      expect(Array.isArray(response.body.sagas)).toBe(true);
      console.log(response.body.sagas);
      //expect(response.body.sagas.length).toBe(2);
    });

    it('devrait filtrer les sagas par statut', async () => {
      const response = await request(app)
        .get('/api/v1/sagas?status=completed')
        .expect(200);

      console.log(response.body.sagas);
      //expect(response.body.sagas.length).toBe(1);
      expect(response.body.sagas[0].status).toBe('completed');
    });
  });

  describe('GET /api/v1/sagas/:id', () => {
    it('devrait retourner une saga spécifique', async () => {
      const response = await request(app)
        .get('/api/v1/sagas/saga-1')
        .expect(200);

      expect(response.body).toHaveProperty('saga');
      expect(response.body.saga.id).toBe('saga-1');
      expect(response.body.saga.type).toBe('purchase_saga');
    });

    it('devrait retourner 404 pour une saga inexistante', async () => {
      const response = await request(app)
        .get('/api/v1/sagas/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/sagas/:id/execute', () => {
    it('devrait exécuter une saga', async () => {
      const response = await request(app)
        .post('/api/v1/sagas/saga-2/execute')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('saga');
    });
  });

  describe('Health Check', () => {
    it('devrait retourner le statut de santé', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('healthy');
    });
  });
}); 