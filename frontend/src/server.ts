import cors from 'cors';
import express, {Request, Response, NextFunction} from 'express';
import session from 'express-session';
import path from 'path';
import authRouter from './routes/authRouter';
import dashboardRouter from './routes/dashboardRouter';
import homeRouter from './routes/homeRouter';

export const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(session({
    secret: 'votre_secret',
    resave: false,
    saveUninitialized: false,
}));

// Middleware combiné : gestion du magasin courant + auth
const excludedPaths = [
    '/login',
    '/logout',
    '/register',
    '/metrics',
    '/grafana',
    '/prometheus',
    '/output.css',
    '/favicon.ico',
    '/Main.js'
];
const excludedPrefixes = ['/public', '/api'];

app.use((req, res, next) => {
    res.locals.currentStore = req.session.selectedStore || null;

    if (
        excludedPaths.includes(req.path) ||
        excludedPrefixes.some(prefix => req.path.startsWith(prefix))
    ) {
        return next();
    }
    if (!req.session.selectedStore) {
        return res.redirect('/login');
    }
    next();
});

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/', authRouter);
app.use('/', dashboardRouter);
app.use('/', homeRouter);

// Gestion des erreurs
app.use((err: Error & { status?: number; error?: string }, req: Request, res: Response, _next: NextFunction) => {
    console.error('Erreur Express:', err);
    const status = typeof err.status === 'number' ? err.status : 500;
    res.status(status).json({
        timestamp: new Date().toISOString(),
        status,
        error: err.error || res.statusMessage || 'Internal Server Error',
        message: err.message || 'Une erreur est survenue.',
        path: req.originalUrl || req.url
    });
});

// 404
app.use((req, res) => {
    res.status(404).send('Page non trouvée');
});