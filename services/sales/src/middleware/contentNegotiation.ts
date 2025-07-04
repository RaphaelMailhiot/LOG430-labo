import { Request, Response, NextFunction } from 'express';

export function contentNegotiation(req: Request, res: Response, next: NextFunction) {
    res.sendData = (data: any) => {
        if (req.accepts('json')) {
            res.type('application/json').send(JSON.stringify(data, null, 2));
        } else if (req.accepts('text')) {
            res.type('text/plain').send(JSON.stringify(data, null, 2));
        } else {
            res.status(406).send('Not Acceptable');
        }
    };
    next();
}