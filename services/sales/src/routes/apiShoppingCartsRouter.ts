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
 * /shopping-carts:
 *   post:
 *     summary: Crée un nouveau chariot
 *     tags:
 *       - Chariots
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Chariot créé avec succès
 */
router.post('/shopping-carts', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newCart = req.body;
        if (!newCart) {
            return res.status(400).sendData({ error: 'Invalid cart data' });
        }
        const createdCart = await shoppingCartsController.createShoppingCart(newCart);
        res.status(201).sendData(createdCart);
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        next(err);
    }
});
/**
 * @openapi
 * /shopping-carts/{cartId}:
 *   put:
 *     summary: Met à jour un chariot avec l'ID du client
 *     tags:
 *       - Chariots
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         description: ID du chariot à mettre à jour
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Chariot mis à jour avec succès
 */
router.put('/shopping-carts/:cartId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cartId = Number(req.params.cartId);
        const updatedCart = await shoppingCartsController.updateShoppingCart(cartId, req.body);
        res.status(200).sendData(updatedCart);
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        next(err);
    }
});
/**
 * @openapi
 * /customers/{customerId}/shopping-carts:
 *   get:
 *     summary: Récupère les chariots d'un client par son ID
 *     tags:
 *       - Chariots
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         description: ID du client dont on veut récupérer les chariots
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des chariots du client
 */
router.get('/customers/:customerId/shopping-carts', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customerId = Number(req.params.customerId);
        const shoppingCarts = await shoppingCartsController.getShoppingCartsByCustomerId(customerId);
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