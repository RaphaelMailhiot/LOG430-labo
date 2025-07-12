import {NextFunction, Request, Response, Router} from 'express';
import { SupplyRequestsController } from '../controllers/supplyRequestsController';

const router = Router();
const supplyRequestsController = new SupplyRequestsController();

/**
 * @openapi
 * /supply-requests:
 *   get:
 *     summary: Récupère toutes les demandes de fournitures
 *     tags:
 *       - Supply Requests
 *     responses:
 *       200:
 *         description: Liste des demandes de fournitures
 */
router.get('/supply-requests', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const supplyRequests = await supplyRequestsController.getAllSupplyRequests();
        res.status(200).sendData(supplyRequests);
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        next(err);
    }
});
/**
 * @openapi
 * /supply-requests:
 *   post:
 *     summary: Crée une nouvelle demande de fournitures
 *     tags:
 *       - Supply Requests
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               store_id:
 *                 type: integer
 *               product_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Demande de fournitures créée avec succès
 */
router.post('/supply-requests', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newSupplyRequest = await supplyRequestsController.createSupplyRequest(req.body);
        res.status(201).sendData(newSupplyRequest);
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        next(err);
    }
});
/**
 * @openapi
 * /stores/{storeId}/supply-requests:
 *   get:
 *     summary: Récupère les demandes de fournitures pour un magasin spécifique
 *     tags:
 *       - Supply Requests
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         description: ID du magasin pour lequel récupérer les demandes de fournitures
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des demandes de fournitures pour le magasin spécifié
 */
router.get('/stores/:storeId/supply-requests', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const storeId = Number(req.params.storeId);
        const supplyRequests = await supplyRequestsController.getSupplyRequestsByStoreId(storeId);
        res.status(200).sendData(supplyRequests);
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        next(err);
    }
});

export default router;