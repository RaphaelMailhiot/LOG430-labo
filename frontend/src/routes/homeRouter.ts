import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const title = 'Accueil';
    res.status(200).render('home', { title });
  } catch (err) {
    next(err);
  }
});

export default router;