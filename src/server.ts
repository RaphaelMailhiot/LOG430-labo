import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import * as path from 'path';
import swaggerUi from 'swagger-ui-express';
// Middlewares et entités
import { AppDataSource } from './data-source';
import { Store } from './entities/Store';
import { contentNegotiation } from './middleware/contentNegotiation';
import { staticTokenAuth } from './middleware/staticTokenAuth';
// Routes
import apiProductsRouter from './routes/apiProductsRouter';
import apiSalesRouter    from './routes/apiSalesRouter';
import apiStoresRouter  from './routes/apiStoresRouter';
import authRouter       from './routes/authRouter';
import homeRouter       from './routes/homeRouter';
import servicesApiRouter from './routes/serviceApiRouter';
import servicesRouter    from './routes/servicesRouter';
// Swagger
import swaggerSpec from './swagger/swaggerConfig';


export const app = express();

// ─── MIDDLEWARES ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'votre_secret',
  resave: false,
  saveUninitialized: false,
}));

// injection du store courant (ou null si DB pas encore up)
app.use(async (req, res, next) => {
  if (!AppDataSource.isInitialized) {
    // en test ou avant init, on court-circuite
    res.locals.currentStore = null;
    return next();
  }

  if (req.session.selectedStore) {
    const storeRepo = AppDataSource.getRepository(Store);
    res.locals.currentStore = await storeRepo.findOneBy({
      id: Number(req.session.selectedStore),
    });
  } else {
    res.locals.currentStore = null;
  }
  next();
});

// injection de tous les stores (ou tableau vide si DB pas up)
app.use(async (req, res, next) => {
  if (!AppDataSource.isInitialized) {
    res.locals.stores = [];
    return next();
  }

  const storeRepo = AppDataSource.getRepository(Store);
  res.locals.stores = await storeRepo.find();
  next();
});

// protection des routes
app.use((req, res, next) => {
  if (['/login','/logout'].includes(req.path)
    || req.path.startsWith('/public')
    || req.path.startsWith('/api')
    || ['/output.css','/favicon.ico','/Main.js'].includes(req.path)
  ) {
    return next();
  }
  if (!req.session.selectedStore) {
    return res.redirect('/login');
  }
  next();
});

// simple logger
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// view engine & static
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '../public')));

// CORS pour /api
app.use('/api', cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// ─── ROUTES ────────────────────────────────────────────────────────────────────
app.use('/', homeRouter);
app.use('/', authRouter);
app.use('/services', servicesRouter);
app.use('/api/v1', servicesApiRouter);

app.use('/api/v2', staticTokenAuth);
app.use('/api/v2', contentNegotiation);
app.use('/api/v2', apiProductsRouter);
app.use('/api/v2', apiStoresRouter);
app.use('/api/v2', apiSalesRouter);

// Swagger UI
const API_STATIC_TOKEN = process.env.API_STATIC_TOKEN || 'api-static-token';
const swaggerUiOptions = {
  swaggerOptions: {
    authAction: {
      bearerAuth: {
        name: 'bearerAuth',
        schema: { type: 'http', scheme: 'bearer', bearerFormat: 'Token' },
        value: `${API_STATIC_TOKEN}`,
      }
    }
  }
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// gestion d’erreurs
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = typeof err.status === 'number' ? err.status : 500;
  res.status(status).json({
    timestamp: new Date().toISOString(),
    status,
    error: err.error || res.statusMessage || 'Internal Server Error',
    message: err.message || 'Une erreur est survenue.',
    path: _req.originalUrl,
  });
});

// 404
app.use((_req, res) => {
  res.status(404).send('Page non trouvée');
});