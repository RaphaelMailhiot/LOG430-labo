import { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../data-source';
import { Store } from '../entities/Store';

const router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const storeRepo = AppDataSource.getRepository(Store);
    const stores = await storeRepo.find();
    console.log('Available stores:', stores);
    res.render('login', { stores });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const storeId = _req.body.storeId;
    if (!storeId) {
      return res.redirect('/');
    }
    _req.session.selectedStore = storeId;
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

export default router;