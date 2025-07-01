import { Request, Response, NextFunction } from 'express';

const API_STATIC_TOKEN = process.env.API_STATIC_TOKEN || 'api-static-token';

export function staticTokenAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (typeof authHeader === 'string' && authHeader === `Bearer ${API_STATIC_TOKEN}`) {
        return next();
    }
    res.status(401).json({ message: 'Non autorisé : token manquant ou invalide' });
}