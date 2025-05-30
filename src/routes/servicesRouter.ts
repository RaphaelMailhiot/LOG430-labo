import { Router, Request, Response, NextFunction } from 'express';
import { ServicesController } from '../controllers/servicesController';

const router = Router();
const servicesController = new ServicesController();

router.get('/recherche-produit', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const title = 'Recherche de produit';
    const message = 'Bienvenue sur la page de recherche de produit !';
    res.status(200).render('search-product', { title, message });
  } catch (err) {
    next(err); 
  }
});

router.get('/ajouter-produit', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const title = 'Ajouter un produit';
    const message = 'Bienvenue sur la page d’ajout de produit !';
    res.status(200).render('add-product', { title, message });
  } catch (err) {
    next(err);
  }
});

router.get('/enregistrer-vente', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const title = 'Enregistrer une vente';
    const message = 'Bienvenue sur la page d’enregistrement de vente !';
    const stock = await servicesController.handleStock();
    res.status(200).render('record-sale', { title, message, stock });
  } catch (err) {
    next(err);
  }
});

router.get('/gerer-retour', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const title = 'Gérer un retour';
    const message = 'Bienvenue sur la page de gestion des retours !';
    const oldSales = await servicesController.handleOldSales();
    res.status(200).render('manage-return', { title, message, oldSales });
  } catch (err) {
    next(err);
  }
});

router.get('/consulter-stock', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const title = 'Consulter le stock';
    const message = 'Bienvenue sur la page de consultation du stock !';
    const stock = await servicesController.handleStock();
    const categories = [...new Set(stock.map(item => item.category))];
    res.status(200).render('view-stock', { title, message, stock, categories });
  } catch (err) {
    next(err);
  }
});

export default router;