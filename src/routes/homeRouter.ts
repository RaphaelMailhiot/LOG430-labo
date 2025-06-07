import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const title = 'Accueil';
    const message = 'Bienvenue sur la page d’accueil !';
    res.status(200).render('home', { title, message });
  } catch (err) {
    next(err);
  }
});

export default router;