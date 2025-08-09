import { Request, Response, NextFunction } from 'express';
import { register, Counter, Histogram } from 'prom-client';

// Métriques Prometheus
const httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});

const sagaTotal = new Counter({
    name: 'saga_total',
    help: 'Total number of sagas',
    labelNames: ['type', 'status']
});

const sagaDuration = new Histogram({
    name: 'saga_duration_seconds',
    help: 'Duration of saga execution in seconds',
    labelNames: ['type'],
    buckets: [1, 5, 10, 30, 60, 120]
});

const sagaStepsTotal = new Counter({
    name: 'saga_steps_total',
    help: 'Total number of saga steps',
    labelNames: ['type', 'status']
});

const sagaFailuresTotal = new Counter({
    name: 'saga_failures_total',
    help: 'Total number of saga failures',
    labelNames: ['type']
});

const sagaCompensationsTotal = new Counter({
    name: 'saga_compensations_total',
    help: 'Total number of saga compensations',
    labelNames: ['type']
});

// Middleware pour mesurer les requêtes HTTP
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const labels = {
            method: req.method,
            route: req.route?.path || req.path,
            status_code: res.statusCode.toString()
        };
        
        httpRequestDuration.observe(labels, duration);
        httpRequestTotal.inc(labels);
    });
    
    next();
};

// Route pour exposer les métriques
export async function metricsRoute(req: Request, res: Response) {
    try {
        res.set('Content-Type', register.contentType);
        const metrics = await register.metrics();
        res.end(metrics);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).end('Error generating metrics: ' + error.message);
        } else {
            res.status(500).end('Error generating metrics: Unknown error');
        }
    }
}

// Fonctions utilitaires pour les métriques de saga
export const recordSagaStart = (type: string) => {
    sagaTotal.inc({ type, status: 'started' });
};

export const recordSagaInProgress = (type: string) => {
    sagaTotal.inc({ type, status: 'in_progress' });
};

export const recordSagaComplete = (type: string, duration: number) => {
    sagaTotal.inc({ type, status: 'completed' });
    sagaDuration.observe({ type }, duration);
};

export const recordSagaFailure = (type: string) => {
    sagaTotal.inc({ type, status: 'failed' });
    sagaFailuresTotal.inc({ type });
};

export const recordSagaCompensation = (type: string) => {
    sagaCompensationsTotal.inc({ type });
};

export const recordSagaStep = (type: string, stepType: string, status: string) => {
    sagaStepsTotal.inc({ type, status });
}; 