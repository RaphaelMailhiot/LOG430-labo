import { Router, Request, Response, NextFunction } from 'express';
import { ServicesController } from '../controllers/servicesController';
import { AppDataSource } from '../data-source';
import { Product } from '../entities/Product';
import { Sale } from '../entities/Sale';
import { SaleItem } from '../entities/SaleItem';
import { Store } from '../entities/Store';
import { Parser } from 'json2csv';

const router = Router();
const servicesController = new ServicesController();

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