import { Router, Request, Response, NextFunction } from 'express';
import { MainStoreController } from '../controllers/mainStoreController';
import { ServicesController } from '../controllers/servicesController';


const router = Router();
const servicesController = new ServicesController();
const mainStoreController = new MainStoreController();
const folderName = 'services';

router.get('', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const title = 'Services';
    const message = 'Bienvenue sur les services';
    res.status(200).render(`${folderName}/services`, { title, message });
  } catch (err) {
    next(err);
  }
});

router.get('/recherche-produit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const title = 'Recherche de produit';
    const message = 'Bienvenue sur la page de recherche de produit !';
    res.status(200).render(`${folderName}/search-product`, { title, message });
  } catch (err) {
    next(err);
  }
});

router.get('/ajouter-produit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const title = 'Ajouter un produit';
    const message = 'Bienvenue sur la page d’ajout de produit !';
    res.status(200).render(`${folderName}/add-product`, { title, message });
  } catch (err) {
    next(err);
  }
});

router.get('/enregistrer-vente', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const title = 'Enregistrer une vente';
    const message = 'Bienvenue sur la page d’enregistrement de vente !';
    const storeId = Number(req.session.selectedStore);
    const stock = await servicesController.handleStock(storeId);
    res.status(200).render(`${folderName}/record-sale`, { title, message, stock });
  } catch (err) {
    next(err);
  }
});

router.get('/gerer-retour', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const title = 'Gérer un retour';
    const message = 'Bienvenue sur la page de gestion des retours !';
    const storeId = Number(req.session.selectedStore);
    const oldSales = await servicesController.handleOldSales(storeId);
    res.status(200).render(`${folderName}/manage-return`, { title, message, oldSales });
  } catch (err) {
    next(err);
  }
});

router.get('/consulter-stock', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const title = 'Consulter le stock';
    const message = 'Bienvenue sur la page de consultation du stock !';
    const storeId = Number(req.session.selectedStore);
    const mainStoreId = await mainStoreController.getMainStoreId();
    const stock = await servicesController.handleStock(storeId);
    const mainStoreStock = await servicesController.handleStock(mainStoreId);
    const categories = [...new Set(stock.map(item => item.product.category))];
    res.status(200).render(`${folderName}/view-stock`, { title, message, stock, categories, mainStoreStock });
  } catch (err) {
    next(err);
  }
});

export default router;