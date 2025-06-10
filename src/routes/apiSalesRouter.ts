import { Router, Request, Response, NextFunction } from 'express';
import { SalesController } from '../controllers/salesController';

const router = Router();
const salesController = new SalesController();

/**
 * @openapi
 * /sales:
 *   get:
 *     summary: Liste toutes les ventes
 *     tags:
 *       - Ventes
 *     responses:
 *       200:
 *         description: Liste des ventes
 */
router.get('/sales', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sales = await salesController.getAllSales();
        res.status(200).sendData(sales);
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = "Bad Request";
        next(err);
    }
});
/**
 * @openapi
 * /stores/:storeId/sales:
 *   get:
 *     summary: Récupère les ventes d'un magasin par son ID
 *     tags:
 *       - Ventes
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         description: ID du magasin à récupérer
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des ventes du magasin
 *       404:
 *         description: Magasin non trouvé
 */
router.get('/stores/:storeId/sales', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const storeId = Number(req.params.storeId);
        const sales = await salesController.getSaleByStore(storeId);
        res.status(200).sendData(sales);
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = "Bad Request";
        next(err);
    }
});
/**
 * @openapi
 * /stores/:storeId/sales/:saleId:
 *   get:
 *     summary: Récupère une vente d'un magasin par son ID
 *     tags:
 *       - Ventes
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         description: ID du magasin
 *         schema:
 *           type: integer
 *       - in: path
 *         name: saleId
 *         required: true
 *         description: ID de la vente à récupérer
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails de la vente
 *       404:
 *         description: Vente ou magasin non trouvé
 */
router.get('/stores/:storeId/sales/:saleId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const storeId = Number(req.params.storeId);
        const saleId = Number(req.params.saleId);
        const sale = await salesController.getSaleById(storeId, saleId);
        if (sale) {
            res.status(200).sendData(sale);
        } else {
            res.status(404).sendData({ error: "Sale not found" });
        }
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = "Bad Request";
        next(err);
    }
});

export default router;