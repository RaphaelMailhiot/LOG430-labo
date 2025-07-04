import { Router, Request, Response, NextFunction } from 'express';
import { ShoppingCartsController } from '../controllers/shoppingCartsController';

const router = Router();
const shoppingCartsController = new ShoppingCartsController();

/**
 * @openapi
 * /shopping-carts:
 *   get:
 *     summary: Liste tous les chariots
 *     tags:
 *       - Chariots
 *     responses:
 *       200:
 *         description: Liste des chariots
 */
router.get('/shopping-carts', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const shoppingCarts = await shoppingCartsController.getAllShoppingCarts();
        res.status(200).sendData(shoppingCarts);
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        next(err);
    }
});
/**
 * @openapi
 * /shopping-carts/{productsId}:
 *   post:
 *     summary: Ajoute un produit à un chariot
 *     tags:
 *       - Chariots
 *     parameters:
 *       - in: path
 *         name: productsId
 *         required: true
 *         description: ID du produit à ajouter au chariot
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Produit ajouté au chariot avec succès
 */
router.post('/shopping-carts/:productsId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productsId = Number(req.params.productsId);
        const shoppingCart = await shoppingCartsController.addProductToCart(productsId, req.body);
        res.status(201).sendData(shoppingCart);
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        next(err);
    }
});

export default router;