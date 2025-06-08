import express from 'express';
import session from 'express-session';
import * as path from 'path';
import { AppDataSource } from './data-source';
import { Store } from './entities/Store';
import { initStores, initProducts } from './initData';
import homeRouter from './routes/homeRouter';
import authRouter from './routes/authRouter';
import servicesApiRouter from './routes/serviceApiRouter';
import servicesRouter from './routes/servicesRouter';

const app = express();

// Initialisation de la base de données
AppDataSource.initialize()
  .then(async () => {
    console.log('Connexion à la base de données réussie !');
    await initStores();
    await initProducts();
  })
  .catch((error) => {
    console.error('Erreur de connexion à la base de données :', error);
  });

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
  console.log(`${req.method} ${req.url}`);
  next();
});

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/', homeRouter);
app.use('/', authRouter);
app.use('/services', servicesRouter);
app.use('/api', servicesApiRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page non trouvée');
});

// Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});