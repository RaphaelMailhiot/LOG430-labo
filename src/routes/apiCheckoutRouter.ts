import { Router, Request, Response, NextFunction } from 'express';
import { CheckoutsController } from '../controllers/checkoutsController';

const router = Router();
const checkoutsController = new CheckoutsController();

/**
 * @openapi
 * /checkouts:
 *   get:
 *     summary: Liste tous les checkouts
 *     tags:
 *       - Checkouts
 *     responses:
 *       200:
 *         description: Liste des checkouts
 */
router.get('/checkouts', async (req: Request, res: Response) => {
    try {
        const checkouts = await checkoutsController.getAllCheckouts();
        res.status(200).sendData(checkouts);
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        res.status(400).sendData({ error: 'Bad Request' });
    }
});
/**
 * @openapi
 * /checkouts/{checkoutId}:
 *   get:
 *     summary: Récupère un checkout par son ID
 *     tags:
 *       - Checkouts
 *     parameters:
 *       - in: path
 *         name: checkoutId
 *         required: true
 *         description: ID du checkout à récupérer
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails du checkout
 *       404:
 *         description: Checkout non trouvé
 */
router.get('/checkouts/:checkoutId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const checkoutId = Number(req.params.checkoutId);
        const checkout = await checkoutsController.getCheckoutById(checkoutId);
        if (checkout) {
            res.status(200).sendData(checkout);
        } else {
            res.status(404).sendData({error: 'Checkout not found'});
        }
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        next(err);
    }
});


export default router;