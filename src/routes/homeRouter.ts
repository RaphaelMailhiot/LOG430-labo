import { Router, Request, Response, NextFunction } from 'express';
import { MainStoreController } from '../controllers/mainStoreController';

const router = Router();
const mainStoreController = new MainStoreController();


router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const title = 'Accueil';
    const message = 'Bienvenue sur la page d’accueil !';

    const storeId = Number(req.session.selectedStore);
    const mainStoreId = await mainStoreController.getMainStoreId();

    let storesData = undefined;
    if (storeId === mainStoreId) {
      storesData = await mainStoreController.getStoresData();
    }

    res.status(200).render('home', { title, message, storesData });
  } catch (err) {
    next(err);
  }
});

export default router;