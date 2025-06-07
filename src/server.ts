import express from 'express';
import session from 'express-session';
import * as path from 'path';
import { AppDataSource } from './data-source';
import { Store } from './entities/Store';
import { initStores, initProducts } from './initData';
import homeRouter from './routes/homeRouter';
import loginRouter from './routes/loginRouter';
import servicesApiRouter from './routes/serviceApiRouter';
import servicesRouter from './routes/servicesRouter';

AppDataSource.initialize()
  .then(async () => {
    console.log('Connexion à la base de données réussie !');
    await initStores();
    await initProducts();
  })
  .catch((error) => {
    console.error('Erreur de connexion à la base de données :', error);
  });

const app = express();

// Middleware
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'votre_secret',
  resave: false,
  saveUninitialized: false,
}));

app.use(async (req, res, next) => {
  if (req.session.selectedStore) {
    const storeRepo = AppDataSource.getRepository(Store);
    res.locals.currentStore = await storeRepo.findOneBy({ id: Number(req.session.selectedStore) });
  } else {
    res.locals.currentStore = null;
  }
  next();
});

app.use((req, res, next) => {
  // Autorise l'accès à la page de connexion ou aux assets publics
  if (
    req.path === '/login' ||
    req.path.startsWith('/public') ||
    req.path.startsWith('/api')
  ) {
    return next();
  }
  // Vérifie si un magasin est sélectionné
  if (!req.session.selectedStore) {
    return res.redirect('/login');
  }
  next();
});

// Logger simple (optionnel)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static (css, js, images)
app.use(express.static(path.join(__dirname, '../public')));

// Routes 
app.use('/', homeRouter);
app.use('/login', loginRouter);
app.use('/services', servicesRouter);
app.use('/api', servicesApiRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page non trouvée');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});