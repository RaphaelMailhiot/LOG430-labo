import { Router, Request, Response, NextFunction } from 'express';
import { StoresController } from '../controllers/storesController';
import { ProductsController } from '../controllers/productsController';
import { SalesController } from '../controllers/salesController';

const router = Router();
const storesController = new StoresController();
const productsController = new ProductsController();
const salesController = new SalesController();

//Stores Routes
/**
 * @openapi
 * /stores:
 *   get:
 *     summary: Liste tous les magasins
 *     responses:
 *       200:
 *         description: Liste des magasins
 */
router.get('/stores', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stores = await storesController.getAllStores();
        res.status(200).sendData(stores);
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = "Bad Request";
        next(err);
    }
});
router.get('/stores/main', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const store = await storesController.getMainStore();
        if (store) {
            res.status(200).sendData(store);
        } else {
            res.status(404).sendData({ error: "Store not found" });
        }
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = "Bad Request";
        next(err);
    }
});
router.get('/stores/:storeId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const storeId = Number(req.params.storeId);
        const store = await storesController.getStoreById(storeId);
        if (store) {
            res.status(200).sendData(store);
        } else {
            res.status(404).sendData({ error: "Store not found" });
        }
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = "Bad Request";
        next(err);
    }
});

//Products Routes
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

//Sales Routes
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