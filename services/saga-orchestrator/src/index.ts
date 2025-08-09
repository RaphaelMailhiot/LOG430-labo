import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import swaggerUi from 'swagger-ui-express';
import { SagaController } from './controllers/sagaController';
import { AppDataSource } from './data-source';
import { logger } from './middleware/logger';
import { metricsMiddleware, metricsRoute } from './middleware/metrics';
import { redis } from './middleware/redisClient';
import createApiSagaRouter from './routes/apiSagaRouter';
import { SagaOrchestratorService } from './services/SagaOrchestratorService';
import swaggerSpec from './swagger/swaggerConfig';
import { swaggerUiOptions } from './swagger/swaggerUiOptions';

// Gestion des signaux d'arrêt
process.on('SIGINT', async () => {
    console.log('🛑 Arrêt du service Saga Orchestrator...');
    await redis.quit();
    process.exit(0);
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
    console.error('🚨 Erreur non capturée:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Promesse rejetée non gérée:', reason, '\nPromise:', promise);
    process.exit(1);
});

const app = express();

// Middleware de base
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ?
        ['http://localhost:3000', 'http://frontend:3000'] :
        '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// Session avec optimisations
app.use(session({
    secret: 'saga_orchestrator_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 heures
    },
}));

// Middleware de logging
app.use((req, res, next) => {
    if (process.env.NODE_ENV !== 'production') {
        logger.info({
            message: 'Requête entrante',
            method: req.method,
            url: req.originalUrl
        });
    }

    res.on('finish', () => {
        if (process.env.NODE_ENV !== 'production') {
            logger.info({
                message: 'Réponse envoyée',
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode
            });
        }
    });
    next();
});

// Métriques
app.use(metricsMiddleware);

// Initialisation de la base de données et du service orchestrateur
let sagaOrchestrator: SagaOrchestratorService | undefined;
let sagaController: SagaController | undefined;

if (process.env.NODE_ENV !== 'test') {
    AppDataSource.initialize()
        .then(() => {
            console.log('✅ Connecté à la base de données');
        })
        .catch((error) => {
            console.error('❌ Erreur de connexion à la base de données :', error);
        });

    // Initialisation du service orchestrateur
    sagaOrchestrator = new SagaOrchestratorService(
        AppDataSource.getRepository('Saga'),
        AppDataSource.getRepository('SagaStep')
    );

    sagaController = new SagaController(sagaOrchestrator);
}

// Routes avec optimisations
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
app.get('/metrics', metricsRoute);

// Routes de l'API Saga
if (!sagaController) {
    const { SagaController } = require('./controllers/sagaController');
    const { SagaOrchestratorService } = require('./services/SagaOrchestratorService');
    sagaOrchestrator = new SagaOrchestratorService();
    sagaController = new SagaController(sagaOrchestrator);
}
app.use('/api/v1', createApiSagaRouter(sagaController!));

// Health check
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
        status: 'healthy',
        service: 'saga-orchestrator',
        timestamp: new Date().toISOString()
    });
});

// Error handling
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = typeof err.status === 'number' ? err.status : 500;

    if (process.env.NODE_ENV !== 'production') {
        console.error('Erreur:', err);
    }

    res.status(status).json({
        timestamp: new Date().toISOString(),
        status,
        error: err.error || res.statusMessage || 'Erreur interne',
        message: err.message || 'Une erreur est survenue.',
        path: req.originalUrl || req.url
    });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('❌ Unhandled error', err);
    res.status(500).json({ error: 'Internal Server Error', details: err?.message });
});

app.use((_req: Request, res: Response) => {
    res.status(404).send('Page non trouvée du service Saga Orchestrator');
});

// Listening
if (process.env.NODE_ENV !== 'test') {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`🚀 Service Saga Orchestrator démarré sur le port ${port}`);
        console.log(`📊 Mode: ${process.env.NODE_ENV || 'development'}`);
    });
}

export default app; 