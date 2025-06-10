import { Router, Request, Response, NextFunction } from 'express';
import { MainStoreController } from '../controllers/mainStoreController';
import { ServicesController } from '../controllers/servicesController';

const router = Router();
const servicesController = new ServicesController();
const mainStoreController = new MainStoreController();

router.post('/search-product', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const storeId = Number(req.session.selectedStore);
    const results = await servicesController.handleSearch(req.body.productNameInput, storeId);
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

router.post('/add-product', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, category, price, stock } = req.body;
    const storeId = Number(req.session.selectedStore);
    const success = await servicesController.handleAddProduct(name, category, price, stock, storeId);
    res.status(200).json({ success });
  } catch (err) {
    next(err);
  }
});

router.post('/record-sale', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const storeId = Number(req.session.selectedStore);
    const { items } = req.body;
    const result = await servicesController.handleSale(items, storeId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/manage-return', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { saleId } = req.body;
    const storeId = Number(req.session.selectedStore);
    await servicesController.handleReturn(Number(saleId), storeId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.get('/rapport', async (_: Request, res: Response, next: NextFunction) => {
  try {
    await mainStoreController.generateReport(res);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.post('/supply-request', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = Number(req.body.productId);
    const quantity = Number(req.body.quantity);
    const storeId = Number(req.session.selectedStore);
    console.log(`Demande de réapprovisionnement pour le produit ${productId} (quantité: ${quantity}) dans le magasin ${storeId}`);
    await servicesController.handleSupplyRequest(productId, quantity, storeId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;