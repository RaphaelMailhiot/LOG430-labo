import { AppDataSource } from '../data-source';
import { Sale } from '../entities/Sale';
import { SaleItem } from '../entities/SaleItem';
import { Store } from '../entities/Store';
import { Parser } from 'json2csv';
import { Response } from 'express';

export class MainStoreController {
  async generateReport(res: Response) {
    const storeRepo = AppDataSource.getRepository(Store);
    const saleRepo = AppDataSource.getRepository(Sale);
    const saleItemRepo = AppDataSource.getRepository(SaleItem);
    const inventoryRepo = AppDataSource.getRepository('inventory');

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

    // Stocks restants par magasin (depuis inventory)
    const stocks = await inventoryRepo
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.product', 'product')
      .leftJoinAndSelect('inventory.store', 'store')
      .getMany();

    const stocksData = stocks.map(s => ({
      Produit: s.product ? s.product.name : '',
      Magasin: s.store ? s.store.name : '',
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

    return { success: true };
  }
}