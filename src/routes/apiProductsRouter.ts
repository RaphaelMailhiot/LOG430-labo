import { Router, Request, Response, NextFunction } from 'express';
import { ProductsController } from '../controllers/productsController';
import { StoresController } from '../controllers/storesController';

const router = Router();
const productsController = new ProductsController();
const storesController = new StoresController();

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
        (err as any).error = "Bad Request";
        next(err);
    }
});
/**
 * @openapi
 * /stores/main/products:
 *   get:
 *     summary: Récupère les produits du magasin principal
 *     tags:
 *       - Produits
 *     responses:
 *       200:
 *         description: Liste des produits du magasin principal
 */
router.get('/stores/main/products', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const store = await storesController.getMainStore();
        const products = await productsController.getStoreInventory(store.id);
        res.status(200).sendData(products);
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = "Bad Request";
        next(err);
    }
});
/**
 * @openapi
 * /stores/:storeId/products:
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
 *         description: Liste des produits du magasin
 *       404:
 *         description: Magasin non trouvé
 */
router.get('/stores/:storeId/products', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const storeId = Number(req.params.storeId);
        const products = await productsController.getStoreInventory(storeId);
        res.status(200).sendData(products);
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = "Bad Request";
        next(err);
    }
});
router.get('/stores/:storeId/products/:productId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const storeId = Number(req.params.storeId);
        const productId = Number(req.params.productId);
        const product = await productsController.getProductById(storeId, productId);
        if (product) {
            res.status(200).sendData(product);
        } else {
            res.status(404).sendData({ error: "Product not found" });
        }
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = "Bad Request";
        next(err);
    }
});
/**
 * @openapi
 * /stores/:storeId/products/:productId:
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
        const product = await productsController.updateProductById(storeId, productId, req.body);
        if (product) {
            res.status(200).sendData(product);
        } else {
            res.status(404).sendData({ error: "Product not found" });
        }
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = "Bad Request";
        next(err);
    }
});

export default router;