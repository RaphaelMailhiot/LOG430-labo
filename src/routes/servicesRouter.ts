import { Router, Request, Response, NextFunction } from 'express';
import { ServicesController } from '../controllers/servicesController';
import { Parser } from 'json2csv';
import { AppDataSource } from '../data-source';
import { Store } from '../entities/Store';
import { Product } from '../entities/Product';
import { Sale } from '../entities/Sale';
import { SaleItem } from '../entities/SaleItem';

const router = Router();
const servicesController = new ServicesController();
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
    const stock = await servicesController.handleStock(storeId);
    console.log('Stock:', stock);
    const categories = [...new Set(stock.map(item => item.product.category))];
    res.status(200).render(`${folderName}/view-stock`, { title, message, stock, categories });
  } catch (err) {
    next(err);
  }
});

router.get('/rapport', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const storeRepo = AppDataSource.getRepository(Store);
    const productRepo = AppDataSource.getRepository(Product);
    const saleRepo = AppDataSource.getRepository(Sale);
    const saleItemRepo = AppDataSource.getRepository(SaleItem);

    // Ventes par magasin
    const stores = await storeRepo.find({ relations: ['sales'] });
    const ventesParMagasin = await Promise.all(stores.map(async store => {
      const ventes = await saleRepo.count({ where: { store: { id: store.id } } });
      return { Magasin: store.name, Ventes: ventes };
    }));

    // Produits les plus vendus
    const produitsVendus = await saleItemRepo
      .createQueryBuilder('item')
      .select('item.product_id', 'ProduitID')
      .addSelect('SUM(item.quantity)', 'TotalVendu')
      .groupBy('item.product_id')
      .orderBy('"TotalVendu"', 'DESC')
      .limit(10)
      .getRawMany();

    // Stocks restants
    const stocks = await productRepo.find({ relations: ['store'] });
    const stocksData = stocks.map(s => ({
      Produit: s.name,
      Magasin: s.store.name,
      Stock: s.stock
    }));

    // Génère chaque section séparément
    const parserVentes = new Parser({ fields: ['Magasin', 'Ventes'] });
    const parserProduits = new Parser({ fields: ['ProduitID', 'TotalVendu'] });
    const parserStocks = new Parser({ fields: ['Produit', 'Magasin', 'Stock'] });

    let csv = '';
    csv += 'Ventes par magasin\n';
    csv += parserVentes.parse(ventesParMagasin) + '\n\n';
    csv += 'Top 10 produits les plus vendus\n';
    csv += parserProduits.parse(produitsVendus) + '\n\n';
    csv += 'Stocks restants\n';
    csv += parserStocks.parse(stocksData);

    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment('rapport.csv');
    res.send('\uFEFF' + csv);
  } catch (err) {
    next(err);
  }
});

export default router;