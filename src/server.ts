import express from 'express';
import * as path from 'path';
import homeRouter from './routes/homeRouter';
import servicesRouter from './routes/servicesRouter';

const app = express();

// Middleware
app.use(express.json());

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
app.use('/services', servicesRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page non trouvée');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});