import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';

const router = Router();


router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const apiResponse = await axios.get('http://localhost/stores/api/v1/stores');
    const data = apiResponse.data;
    res.status(200).render('home', { title: 'Accueil', message: 'Choisir un magasin', data });
  } catch (err) {
    next(err);
  }
});

export default router;