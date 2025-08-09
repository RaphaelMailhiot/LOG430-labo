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
// Mock data-source
jest.mock('../src/data-source', () => ({
    AppDataSource: {
        getRepository: jest.fn((entity) => {
            const isSaga = (x: any) => x === 'Saga' || x?.name === 'Saga';
            const isSagaStep = (x: any) => x === 'SagaStep' || x?.name === 'SagaStep';

            // ajoute les méthodes d'instance de SagaStep utilisées par le service
            const wrapStep = (raw: any) => {
                if (!raw) return raw;
                // évite de doubler les méthodes si déjà wrap
                if (typeof raw.markAsInProgress === 'function') return raw;

                return {
                    ...raw,
                    markAsInProgress() {
                        this.status = 'in_progress';
                        this.started_at = new Date();
                    },
                    markAsCompleted(output?: Record<string, any>) {
                        this.status = 'completed';
                        this.completed_at = new Date();
                        if (output !== undefined) this.output_data = output;
                    },
                    markAsFailed(errorMessage?: string) {
                        this.status = 'failed';
                        this.error_message = errorMessage ?? null;
                    },
                    markAsCompensated() {
                        this.status = 'compensated';
                        this.compensated_at = new Date();
                    },
                    getDuration() {
                        return this.started_at && this.completed_at
                            ? this.completed_at.getTime() - this.started_at.getTime()
                            : null;
                    },
                };
            };

            // === Wrapper pour donner les méthodes d'instance aux Sagas ===
            const wrapSaga = (raw: any) => {
                if (!raw) return raw;
                if (typeof raw.markAsInProgress === 'function') return raw;

                return {
                    ...raw,
                    markAsInProgress() {
                        this.status = 'in_progress';
                        this.started_at = new Date();
                    },
                    incrementRetryCount() {
                        this.retry_count = (this.retry_count ?? 0) + 1;
                    },
                    markAsCompleted() {
                        this.status = 'completed';
                        this.completed_at = new Date();
                    },
                    markAsFailed(errorMessage?: string) {
                        this.status = 'failed';
                        this.error_message = errorMessage ?? null;
                    },
                };
            };


            if (isSaga(entity)) {
                return {
                    find: jest.fn((opts?: any) => {
                        let rows = [...sagas];

                        if (opts?.order?.created_at === 'DESC') {
                            rows.sort((a, b) => +b.created_at - +a.created_at);
                        } else if (opts?.order?.created_at === 'ASC') {
                            rows.sort((a, b) => +a.created_at - +b.created_at);
                        }

                        if (opts?.relations?.includes?.('steps')) {
                            rows = rows.map(s => ({
                                ...s,
                                steps: sagaSteps
                                    .filter(st => st.saga_id === s.id)
                                    .sort((a, b) => a.step_order - b.step_order)
                                    .map(wrapStep),
                            }));
                        }

                        // ⬇️ wrap la Saga AVANT de retourner
                        return Promise.resolve(rows.map(wrapSaga));
                    }),


                    findOne: jest.fn(({ where, relations }: any) => {
                        const saga = sagas.find(s => s.id === where.id);
                        if (!saga) return Promise.resolve(null);

                        if (relations?.includes?.('steps')) {
                            const withSteps = {
                                ...saga,
                                steps: sagaSteps
                                    .filter(st => st.saga_id === saga.id)
                                    .sort((a, b) => a.step_order - b.step_order)
                                    .map(wrapStep),
                            };
                            return Promise.resolve(wrapSaga(withSteps));
                        }

                        return Promise.resolve(wrapSaga({ ...saga }));
                    }),


                    save: jest.fn((saga) => {
                        if (!saga.id) saga.id = `saga-${Date.now()}`;
                        const i = sagas.findIndex(s => s.id === saga.id);
                        if (i >= 0) sagas[i] = { ...sagas[i], ...saga };
                        else sagas.push({ ...saga });
                        return Promise.resolve(wrapSaga({ ...saga }));
                    }),


                    create: jest.fn((data) => ({ ...data, id: `saga-${Date.now()}` })),
                    clear: jest.fn(() => { sagas.length = 0; return Promise.resolve(); }),
                };
            }

            if (isSagaStep(entity)) {
                return {
                    // Supporte where.saga_id, where.status, where.saga.id et order.step_order
                    find: jest.fn((opts?: any) => {
                        let rows = [...sagaSteps];

                        const where = opts?.where ?? {};
                        const wantedSagaId = where.saga_id ?? where.saga?.id;

                        if (wantedSagaId) {
                            rows = rows.filter(st => st.saga_id === wantedSagaId);
                        }
                        if (where.status) {
                            rows = rows.filter(st => st.status === where.status);
                        }

                        if (opts?.order?.step_order === 'ASC') {
                            rows.sort((a, b) => a.step_order - b.step_order);
                        } else if (opts?.order?.step_order === 'DESC') {
                            rows.sort((a, b) => b.step_order - a.step_order);
                        }

                        return Promise.resolve(rows.map(wrapStep));
                    }),

                    // IMPORTANT: gère id OU (saga_id/saga.id + status)
                    findOne: jest.fn(({ where }: any) => {
                        const wantedSagaId = where?.saga_id ?? where?.saga?.id;

                        const match = (st: any) =>
                            (where?.id ? st.id === where.id : true) &&
                            (wantedSagaId ? st.saga_id === wantedSagaId : true) &&
                            (where?.status ? st.status === where.status : true);

                        const step = sagaSteps.find(match);
                        return Promise.resolve(step ? wrapStep(step) : null);
                    }),

                    // Persiste les changements de status/output/etc.
                    save: jest.fn((step: any) => {
                        const id = step.id ?? `step-${Date.now()}`;
                        const idx = sagaSteps.findIndex(st => st.id === id);
                        if (idx >= 0) {
                            sagaSteps[idx] = { ...sagaSteps[idx], ...step, id };
                            return Promise.resolve(wrapStep(sagaSteps[idx]));
                        }
                        const created = { id, ...step };
                        sagaSteps.push(created);
                        return Promise.resolve(wrapStep(created));
                    }),

                    create: jest.fn((data: any) => ({ ...data, id: `step-${Date.now()}` })),

                    clear: jest.fn(() => {
                        sagaSteps.length = 0;
                        return Promise.resolve();
                    }),
                };
            }

            throw new Error('Unknown repository requested in test mock');
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
        sagaSteps.push(
            {
                id: 'step-1',
                saga_id: 'saga-2',
                step_order: 1,
                type: 'validate_return',   // StepType.VALIDATE_RETURN
                status: 'pending',
                input_data: { sale_id: 789, customer_id: 123 },
                retry_count: 0,
                max_retries: 3,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: 'step-2',
                saga_id: 'saga-2',
                step_order: 2,
                type: 'process_refund',    // StepType.PROCESS_REFUND
                status: 'pending',
                input_data: { sale_id: 789, customer_id: 123 },
                retry_count: 0,
                max_retries: 3,
                created_at: new Date(),
                updated_at: new Date(),
            }
        );

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