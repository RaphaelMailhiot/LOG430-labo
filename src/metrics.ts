import express from 'express';
import client from 'prom-client';

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics(); // CPU, mémoire, event loop, etc.

export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Durée des requêtes HTTP en secondes',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5],
});

export const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Nombre total de requêtes HTTP',
  labelNames: ['method', 'route', 'status'],
});

// Middleware Express pour mesurer latence et compter les requêtes
export function metricsMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const end = httpRequestDuration.startTimer({ method: req.method, route: req.route?.path || req.path });
  res.on('finish', () => {
    end({ status: res.statusCode });
    httpRequestCounter.inc({ method: req.method, route: req.route?.path || req.path, status: res.statusCode });
  });
  next();
}

// ✅ Route /metrics corrigée
export async function metricsRoute(req: express.Request, res: express.Response) {
  try {
    res.set('Content-Type', client.register.contentType);
    const metrics = await client.register.metrics();
    res.end(metrics);
  } catch (error) {
    res.status(500).end('Error generating metrics');
  }
}