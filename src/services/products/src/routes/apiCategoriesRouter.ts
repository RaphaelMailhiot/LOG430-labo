import { Router, Request, Response, NextFunction } from 'express';
import { CategoriesController } from '../controllers/categoriesController';

const router = Router();
const categoriesController = new CategoriesController();

/**
 * @openapi
 * /categories:
 *   get:
 *     summary: Liste tous les categories
 *     tags:
 *       - Categories
 *     responses:
 *       200:
 *         description: Liste des categories
 */
router.get('/categories', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await categoriesController.getAllCategories();
        res.status(200).sendData(categories);
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        next(err);
    }
});
/**
 * @openapi
 * /categories/{id}:
 *   get:
 *     summary: Récupère une catégorie par son ID
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails de la catégorie
 *       404:
 *         description: Catégorie non trouvée
 */
router.get('/categories/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const category = await categoriesController.getCategoriesById(id);
        if (category) {
            res.status(200).sendData(category);
        } else {
            res.status(404).sendData({ error: 'Category not found' });
        }
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        next(err);
    }
});
/**
 * @openapi
 * /categories/product/{productId}:
 *   get:
 *     summary: Récupère la catégorie d'un produit par son ID
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails de la catégorie du produit
 *       404:
 *         description: Catégorie non trouvée pour ce produit
 */
router.get('/categories/product/:productId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productId = Number(req.params.productId);
        const category = await categoriesController.getCategoryByProductId(productId);
        if (category) {
            res.status(200).sendData(category);
        } else {
            res.status(404).sendData({error: 'Category not found for this product'});
        }
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        next(err);
    }
});
/**
 * @openapi
 * /categories:
 *   post:
 *     summary: Crée une nouvelle catégorie
 *     tags:
 *       - Categories
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Catégorie créée avec succès
 *       400:
 *         description: Requête invalide
 */
router.post('/categories', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newCategory = req.body;
        if (!newCategory || !newCategory.name) {
            return res.status(400).sendData({ error: 'Invalid category data' });
        }
        const createdCategory = await categoriesController.createCategory(newCategory);
        res.status(201).sendData(createdCategory);
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        next(err);
    }
});

export default router;