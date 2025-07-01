import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import session from 'express-session';
import { contentNegotiation } from './middleware/contentNegotiation';
import { staticTokenAuth } from './middleware/staticTokenAuth';
import { logger } from './middleware/logger';
import { redis } from './middleware/redisClient';
import { metricsMiddleware, metricsRoute } from './middleware/metrics';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger/swaggerConfig';
import { swaggerUiOptions } from './swagger/swaggerUiOptions';
import apiCustomersRouter from "./routes/apiCustomersRouter";
import apiManagersRouter from "./routes/apiManagersRouter";

// Gestion des signaux d'arrêt
process.on('SIGINT', async () => {
    await redis.quit();
    process.exit(0);
});

const app = express();
app.use(metricsMiddleware);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'votre_secret',
    resave: false,
    saveUninitialized: false,
}));
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use((req, res, next) => {
    logger.info({ message: 'Requête entrante', method: req.method, url: req.originalUrl });
    res.on('finish', () => {
        logger.info({ message: 'Réponse envoyée', method: req.method, url: req.originalUrl, status: res.statusCode });
    });
    next();
});

//Routes
app.use('/metrics', metricsRoute);
app.use('/api/v1', contentNegotiation);
app.use('/api/v1', staticTokenAuth);
app.use('/api/v1', apiCustomersRouter);
app.use('/api/v1', apiManagersRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

//Error handling
app.use((err:any, req:Request, res:Response, _next:NextFunction) => {
    const status = typeof err.status === 'number' ? err.status : 500;
    res.status(status).json({
        timestamp: new Date().toISOString(),
        status,
        error: err.error || res.statusMessage || 'Erreur interne',
        message: err.message || 'Une erreur est survenue.',
        path: req.originalUrl || req.url
    });
});
app.use((_req:Request, res:Response) => {
    res.status(404).send('Page non trouvée');
});

//Listening
app.listen(3000, () => console.log('Service Auth démarré sur le port 3000'));