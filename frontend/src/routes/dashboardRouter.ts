import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

router.get('/dashboard', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const title = 'Dashboard';
        res.status(200).render('dashboard/dashboard', { title });
    } catch (err) {
        next(err);
    }
});

export default router;