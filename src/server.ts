import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import * as path from 'path';
// Database
import swaggerUi from 'swagger-ui-express';
import { AppDataSource } from './data-source';
import { Store } from './entities/Store';
// Routes
import { logger } from './logger';
import { metricsMiddleware, metricsRoute } from './metrics';
import { contentNegotiation } from './middleware/contentNegotiation';
import { staticTokenAuth } from './middleware/staticTokenAuth';
import { redis } from './redisClient';
import apiCustomersRouter from './routes/apiCustomersRouter';
import apiProductsRouter from './routes/apiProductsRouter';
import apiSalesRouter from './routes/apiSalesRouter';
import apiShoppingCartsRouter from './routes/apiShoppingCartsRouter';
import apiStoresRouter from './routes/apiStoresRouter';
import authRouter from './routes/authRouter';
import homeRouter from './routes/homeRouter';
import servicesApiRouter from './routes/serviceApiRouter';
import servicesRouter from './routes/servicesRouter';
// Swagger
import swaggerSpec from './swagger/swaggerConfig';
// Redis

process.on('SIGINT', async () => {
  await redis.quit();
  process.exit(0);
});

export const app = express();

app.use(metricsMiddleware);

// Initialisation de la base de données
if (process.env.NODE_ENV !== 'test') {
  AppDataSource.initialize()
    .then(() => {
      console.log('Connecté à la base de données');
    })
    .catch((error) => {
      console.error('Erreur de connexion à la base de données :', error);
    });
}

// Middlewares globaux
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'votre_secret',
  resave: false,
  saveUninitialized: false,
}));

// Middleware pour injecter le magasin courant dans res.locals
app.use(async (req, res, next) => {
  if (req.session.selectedStore) {
    const storeRepo = AppDataSource.getRepository(Store);
    res.locals.currentStore = await storeRepo.findOneBy({ id: Number(req.session.selectedStore) });
  } else {
    res.locals.currentStore = null;
  }
  next();
});

// Middleware pour injecter tous les magasins (pratique pour les menus)
app.use(async (req, res, next) => {
  const storeRepo = AppDataSource.getRepository(Store);
  res.locals.stores = await storeRepo.find();
  next();
});

// Middleware de protection des routes (sauf login/public/api)
app.use((req, res, next) => {
  if (
  req.path === '/login' ||
  req.path === '/logout' ||
  req.path.startsWith('/public') ||
  req.path.startsWith('/api') ||
  req.path === '/metrics' ||
  req.path === '/output.css' ||
  req.path === '/favicon.ico' ||
  req.path === '/Main.js'
) {
  return next();
}
  if (!req.session.selectedStore) {
    return res.redirect('/login');
  }
  next();
});

// Logger simple
app.use((req, res, next) => {
  logger.info({ message: 'Requête entrante', method: req.method, url: req.originalUrl });
  res.on('finish', () => {
    logger.info({ message: 'Réponse envoyée', method: req.method, url: req.originalUrl, status: res.statusCode });
  });
  next();
});

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// CORS configuration for API
app.use('/api', cors({
  origin: '*', // Mettre l'URL client
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Routes
app.use('/', homeRouter);
app.use('/', authRouter);
app.use('/services', servicesRouter);
app.use('/api/v1', servicesApiRouter);

app.use('/api/v2', staticTokenAuth);
app.use('/api/v2', contentNegotiation);
app.use('/api/v2', apiCustomersRouter);
app.use('/api/v2', apiProductsRouter);
app.use('/api/v2', apiSalesRouter);
app.use('/api/v2', apiShoppingCartsRouter);
app.use('/api/v2', apiStoresRouter);



const API_STATIC_TOKEN = process.env.API_STATIC_TOKEN || 'api-static-token';
const swaggerUiOptions = {
  swaggerOptions: {
    authAction: {
      bearerAuth: {
        name: 'bearerAuth',
        schema: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'Token',
        },
        value: `${API_STATIC_TOKEN}`,
      }
    }
  }
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// Endpoint /metrics pour Prometheus
app.get('/metrics', metricsRoute);

// Api errors handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = typeof err.status === 'number' ? err.status : 500;
    res.status(status).json({
        timestamp: new Date().toISOString(),
        status: status,
        error: err.error || res.statusMessage || 'Internal Server Error',
        message: err.message || 'Une erreur est survenue.',
        path: req.originalUrl || req.url
    });
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page non trouvée');
});