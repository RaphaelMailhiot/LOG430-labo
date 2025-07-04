import { Router, Request, Response, NextFunction } from 'express';
import { InventoriesController } from '../controllers/inventoriesController';
import axios from 'axios';

const router = Router();
const inventoriesController = new InventoriesController();


/**
 * @openapi
 * /stores/main/inventory:
 *   get:
 *     summary: Récupère l'inventaire du magasin principal
 *     tags:
 *       - Inventory
 *     responses:
 *       200:
 *         description: L'inventaire du magasin principal
 */
router.get('/stores/main/inventory', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        //TODO fix this
        const response = await axios.get('http://store/stores/main');
        const mainStoreId = response.data.id;
        const products = await inventoriesController.getStoreInventory(mainStoreId);
        res.status(200).sendData(products);
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        next(err);
    }
});
/**
 * @openapi
 * /stores/{storeId}/inventory:
 *   get:
 *     summary: Récupère les produits d'un magasin par son ID
 *     tags:
 *       - Produits
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         description: ID du magasin à récupérer
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: L'inventaire du magasin
 *       404:
 *         description: Magasin non trouvé
 */
router.get('/stores/:storeId/inventory', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const storeId = Number(req.params.storeId);
        const products = await inventoriesController.getStoreInventory(storeId);
        res.status(200).sendData(products);
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        next(err);
    }
});
/**
 * @openapi
 * /stores/{storeId}/inventory/products/{productId}:
 *   get:
 *     summary: Récupère un produit d'un magasin par son ID
 *     tags:
 *       - Produits
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         description: ID du magasin
 *         schema:
 *           type: integer
 *       - in: path
 *         name: productId
 *         required: true
 *         description: ID du produit à récupérer
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails du produit dans le magasin spécifié
 *       404:
 *         description: Produit ou magasin non trouvé
 */
router.get('/stores/:storeId/inventory/products/:productId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const storeId = Number(req.params.storeId);
        const productId = Number(req.params.productId);
        const product = await inventoriesController.getStoreInventoryProductId(storeId, productId);
        if (product) {
            res.status(200).sendData(product);
        } else {
            res.status(404).sendData({ error: 'Product not found' });
        }
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        next(err);
    }
});
/**
 * @openapi
 * /stores/{storeId}/products/{productId}:
 *   put:
 *     summary: Met à jour un produit d'un magasin par son ID
 *     tags:
 *       - Produits
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         description: ID du magasin
 *         schema:
 *           type: integer
 *       - in: path
 *         name: productId
 *         required: true
 *         description: ID du produit à mettre à jour
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Produit mis à jour
 *       404:
 *         description: Produit ou magasin non trouvé
 */
router.put('/stores/:storeId/products/:productId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const storeId = Number(req.params.storeId);
        const productId = Number(req.params.productId);
        const product = await inventoriesController.updateStoreInventoryProductId(storeId, productId, req.body);
        if (product) {
            res.status(200).sendData(product);
        } else {
            res.status(404).sendData({ error: 'Product not found' });
        }
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        next(err);
    }
});

export default router;