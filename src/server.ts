import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';

const app = express();

// CORS pour autoriser le front à appeler les APIs
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Servir les fichiers statiques du build front (ex: React)
app.use(express.static(path.join(__dirname, '../public')));

// Route fallback pour le front (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

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

// Lancer le serveur front
app.listen(3000, () => {
  console.log('Front-end disponible sur le port 3000');
});