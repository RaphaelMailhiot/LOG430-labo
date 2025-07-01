import { Router, Request, Response, NextFunction } from 'express';
import { StoresController } from '../controllers/storesController';

const router = Router();
const storesController = new StoresController();

/**
 * @openapi
 * /stores:
 *   get:
 *     summary: Liste tous les magasins
 *     tags:
 *       - Magasins
 *     responses:
 *       200:
 *         description: Liste des magasins
 */
router.get('/stores', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const stores = await storesController.getAllStores();
        res.status(200).sendData(stores);
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        next(err);
    }
});
/**
 * @openapi
 * /stores/main:
 *   get:
 *     summary: Récupère le magasin principal
 *     tags:
 *       - Magasins
 *     responses:
 *       200:
 *         description: Détails du magasin principal
 *       404:
 *         description: Magasin non trouvé
 */
router.get('/stores/main', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const store = await storesController.getMainStore();
        if (store) {
            res.status(200).sendData(store);
        } else {
            res.status(404).sendData({ error: 'Store not found' });
        }
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        next(err);
    }
});
/**
 * @openapi
 * /stores/{storeId}:
 *   get:
 *     summary: Récupère un magasin par son ID
 *     tags:
 *       - Magasins
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         description: ID du magasin à récupérer
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails du magasin
 *       404:
 *         description: Magasin non trouvé
 */
router.get('/stores/:storeId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const storeId = Number(req.params.storeId);
        const store = await storesController.getStoreById(storeId);
        if (store) {
            res.status(200).sendData(store);
        } else {
            res.status(404).sendData({ error: 'Store not found' });
        }
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        next(err);
    }
});

export default router;