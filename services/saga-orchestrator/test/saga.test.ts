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
    get: jest.fn().mockResolvedValue({data: {data: {id: 1, stock: 10}}}),
    post: jest.fn().mockResolvedValue({data: {payment_id: 'pay-123', transaction_id: 'tx-456', sale_id: 'sale-789'}}),
    patch: jest.fn().mockResolvedValue({data: {success: true}}),
    delete: jest.fn().mockResolvedValue({data: {success: true}}),
}));

import request from 'supertest';
import type {Repository} from 'typeorm';
import {AppDataSource} from '../src/data-source';

// Stores en mémoire pour les tests
const sagas: any[] = [];
const sagaSteps: any[] = [];

// Wraps d’instance (inchangés)
const wrapStep = (raw: any) => raw && (typeof raw.markAsInProgress === 'function' ? raw : {
    ...raw,
    markAsInProgress() {
        this.status = 'in_progress';
        this.started_at = new Date();
    },
    markAsCompleted(output?: any) {
        this.status = 'completed';
        this.completed_at = new Date();
        if (output !== undefined) this.output_data = output;
    },
    markAsFailed(msg?: string) {
        this.status = 'failed';
        this.error_message = msg ?? null;
    },
    markAsCompensated() {
        this.status = 'compensated';
        this.compensated_at = new Date();
    },
    getDuration() {
        return this.started_at && this.completed_at ? this.completed_at.getTime() - this.started_at.getTime() : null;
    },
});
const wrapSaga = (raw: any) => raw && (typeof raw.markAsInProgress === 'function' ? raw : {
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
    markAsFailed(msg?: string) {
        this.status = 'failed';
        this.error_message = msg ?? null;
    },
});

jest.spyOn(AppDataSource as any, 'initialize').mockResolvedValue(AppDataSource as any);
jest.spyOn(AppDataSource as any, 'destroy').mockResolvedValue(undefined as any);

// ⚙️ Mock du manager et de transaction (certaines routes/services l'utilisent)
const fakeManager = {
    getRepository: (entity: any) => (AppDataSource as any).getRepository(entity),
};

Object.defineProperty(AppDataSource as any, 'manager', {
    get: () => ({
        transaction: async (cb: (mgr: any) => any) => cb(fakeManager),
    }),
});


jest.spyOn(AppDataSource as any, 'getRepository').mockImplementation((entity: any) => {
    const name = typeof entity === 'string' ? entity : entity?.name;

    if (name === 'Saga') {
        // ⬇️ on isole l'implémentation de find pour éviter la référence circulaire
        const findImpl = (opts?: any): Promise<any[]> => {
            let rows = [...sagas];

            if (opts?.order?.created_at === 'DESC') rows.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
            if (opts?.order?.created_at === 'ASC') rows.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));

            if (opts?.relations?.includes?.('steps')) {
                rows = rows.map(s => ({
                    ...s,
                    steps: sagaSteps
                        .filter(st => st.saga_id === s.id)
                        .sort((a, b) => a.step_order - b.step_order)
                        .map(wrapStep),
                }));
            }

            return Promise.resolve(rows.map(wrapSaga));
        };

        const repo = {
            find: jest.fn(findImpl),

            findOne: jest.fn(({where, relations}: any): Promise<any | null> => {
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
                return Promise.resolve(wrapSaga({...saga}));
            }),

            save: jest.fn((saga: any): Promise<any> => {
                if (!saga.id) saga.id = `saga-${Date.now()}`;
                const i = sagas.findIndex(s => s.id === saga.id);
                if (i >= 0) sagas[i] = {...sagas[i], ...saga};
                else sagas.push({...saga});
                return Promise.resolve(wrapSaga({...saga}));
            }),

            create: jest.fn((data: any) => ({...data, id: `saga-${Date.now()}`})),
            clear: jest.fn((): Promise<void> => {
                sagas.length = 0;
                return Promise.resolve();
            }),

            // ✅ types de retour explicites → finit TS7024
            count: jest.fn((opts?: any): Promise<number> =>
                findImpl(opts).then((rows) => rows.length)
            ),
            findAndCount: jest.fn((opts?: any): Promise<[any[], number]> =>
                findImpl(opts).then((rows) => [rows, rows.length])
            ),
        };

        return repo as unknown as Repository<any>;
    }

    if (name === 'SagaStep') {
        const findImpl = (opts?: any): Promise<any[]> => {
            let rows = [...sagaSteps];
            const where = opts?.where ?? {};
            const wantedSagaId = where.saga_id ?? where.saga?.id;

            if (wantedSagaId) rows = rows.filter(st => st.saga_id === wantedSagaId);
            if (where.status) rows = rows.filter(st => st.status === where.status);

            if (opts?.order?.step_order === 'ASC') rows.sort((a, b) => a.step_order - b.step_order);
            if (opts?.order?.step_order === 'DESC') rows.sort((a, b) => b.step_order - a.step_order);

            return Promise.resolve(rows.map(wrapStep));
        };

        const repo = {
            find: jest.fn(findImpl),

            findOne: jest.fn(({where}: any): Promise<any | null> => {
                const wantedSagaId = where?.saga_id ?? where?.saga?.id;
                const match = (st: any) =>
                    (where?.id ? st.id === where.id : true) &&
                    (wantedSagaId ? st.saga_id === wantedSagaId : true) &&
                    (where?.status ? st.status === where.status : true);

                const step = sagaSteps.find(match);
                return Promise.resolve(step ? wrapStep(step) : null);
            }),

            save: jest.fn((step: any): Promise<any> => {
                const id = step.id ?? `step-${Date.now()}`;
                const idx = sagaSteps.findIndex(st => st.id === id);
                if (idx >= 0) {
                    sagaSteps[idx] = {...sagaSteps[idx], ...step, id};
                    return Promise.resolve(wrapStep(sagaSteps[idx]));
                }
                const created = {id, ...step};
                sagaSteps.push(created);
                return Promise.resolve(wrapStep(created));
            }),

            create: jest.fn((data: any) => ({...data, id: `step-${Date.now()}`})),
            clear: jest.fn((): Promise<void> => {
                sagaSteps.length = 0;
                return Promise.resolve();
            }),

            // ✅ types de retour explicites
            count: jest.fn((opts?: any): Promise<number> =>
                findImpl(opts).then((rows) => rows.length)
            ),
            findAndCount: jest.fn((opts?: any): Promise<[any[], number]> =>
                findImpl(opts).then((rows) => [rows, rows.length])
            ),
        };

        return repo as unknown as Repository<any>;
    }


    throw new Error(`Unknown repository requested: ${name}`);
});

// Mock les exécuteurs de saga
jest.mock('../src/services/executors/PurchaseSagaExecutor', () => ({
    PurchaseSagaExecutor: jest.fn().mockImplementation(() => ({
        executeStep: jest.fn().mockResolvedValue({success: true}),
        compensateStep: jest.fn().mockResolvedValue(undefined),
        getNextStep: jest.fn().mockReturnValue(null),
        getCompensationStep: jest.fn().mockReturnValue({type: 'compensation', status: 'pending'}),
    })),
}));

jest.mock('../src/services/executors/ReturnSagaExecutor', () => ({
    ReturnSagaExecutor: jest.fn().mockImplementation(() => ({
        executeStep: jest.fn().mockResolvedValue({success: true}),
        compensateStep: jest.fn().mockResolvedValue(undefined),
        getNextStep: jest.fn().mockReturnValue(null),
        getCompensationStep: jest.fn().mockReturnValue({type: 'compensation', status: 'pending'}),
    })),
}));


// Mock data
const seedSagas = [
    {
        id: 'saga-1',
        type: 'purchase_saga',
        status: 'completed',
        data: {store_id: 1, customer_id: 123},
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: 'saga-2',
        type: 'return_saga',
        status: 'pending',
        data: {sale_id: 789, customer_id: 123},
        created_at: new Date(),
        updated_at: new Date()
    }
];

import app from '../src/index';

beforeEach(() => {
    sagas.length = 0;
    sagaSteps.length = 0;
    sagas.push(...seedSagas);
});

afterAll(() => {
    jest.restoreAllMocks();
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
                        {product_id: 456, quantity: 2, price: 29.99}
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
                        {product_id: 456, quantity: 1, reason: 'defective'}
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
                    input_data: {sale_id: 789, customer_id: 123},
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
                    input_data: {sale_id: 789, customer_id: 123},
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