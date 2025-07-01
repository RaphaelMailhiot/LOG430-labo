import { Router, Request, Response, NextFunction } from 'express';
import { ProductsController } from '../controllers/productsController';

const router = Router();
const productsController = new ProductsController();

/**
 * @openapi
 * /products:
 *   get:
 *     summary: Liste tous les produits
 *     tags:
 *       - Produits
 *     responses:
 *       200:
 *         description: Liste des produits
 */
router.get('/products', async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Pagination
        const page = parseInt(req.query.page as string) || 1;
        const size = parseInt(req.query.size as string) || 20;
        const skip = (page - 1) * size;

        // Filtrage
        const category = req.query.category as string | undefined;

        // Tri
        let sort: any = { name: 'ASC' }; // défaut
        if (req.query.sort) {
            const [field, order] = (req.query.sort as string).split(',');
            sort = { [field]: (order || 'ASC').toUpperCase() };
        }

        // Appelle ton service ou repo avec ces paramètres
        const { data, total } = await productsController.getProductsPaginated({
            skip,
            take: size,
            category,
            sort
        });

        // Calcul des métadonnées de pagination
        const totalPages = Math.ceil(total / size);

        res.sendData({
            data,
            pagination: {
                total_records: total,
                current_page: page,
                total_pages: totalPages,
                next_page: page < totalPages ? page + 1 : null,
                prev_page: page > 1 ? page - 1 : null
            }
        });
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        next(err);
    }
});
/**
 * @openapi
 * /products/category/{categoryId}:
 *   get:
 *     summary: Liste les produits par catégorie
 *     tags:
 *       - Produits
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: Id de la catégorie
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des produits dans la catégorie spécifiée
 *       404:
 *         description: Liste des produits non trouvé
 */
router.get('/products/category/:categoryId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categoryId = Number(req.params.categoryId);
        const products = await productsController.getProductsByCategoryId(categoryId);
        if (products && products.length > 0) {
            res.status(200).sendData(products);
        } else {
            res.status(404).sendData({error: 'Products not found in this category'});
        }
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        next(err);
    }
});

export default router;