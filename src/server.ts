import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import path from 'path';
import cors from 'cors';
import homeRouter from './routes/homeRouter';
import authRouter from './routes/authRouter';

export const app = express();

// Middlewares globaux
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'votre_secret',
  resave: false,
  saveUninitialized: false,
}));

// CORS pour autoriser le front à appeler les APIs
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/', homeRouter);
app.use('/', authRouter);

// Errors handler
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