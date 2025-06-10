import { Router, Request, Response, NextFunction } from 'express';
import { MainStoreController } from '../controllers/mainStoreController';
import { SupplyRequest } from '../entities/SupplyRequest';

const router = Router();
const mainStoreController = new MainStoreController();


router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const title = 'Accueil';
    const message = 'Bienvenue sur la page d’accueil !';

    const storeId = Number(req.session.selectedStore);
    const mainStoreId = await mainStoreController.getMainStoreId();

    let storesData = undefined;
    let supplyRequest: SupplyRequest[] = [];
    if (storeId === mainStoreId) {
      storesData = await mainStoreController.getStoresData();
      supplyRequest = await mainStoreController.getSupplyRequest();
    }

    console.log(supplyRequest);

    res.status(200).render('home', { title, message, storesData, supplyRequest });
  } catch (err) {
    next(err);
  }
});

export default router;