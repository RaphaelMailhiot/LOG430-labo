import axios from 'axios';
import { Router, Request, Response, NextFunction } from 'express';

const router = Router();
const apiInventory = axios.create({
  baseURL: 'http://kong:8000/inventory/api/v1',
});
const apiProducts = axios.create({
  baseURL: 'http://kong:8000/products/api/v1',
});
const apiSales = axios.create({
    baseURL: 'http://kong:8000/sales/api/v1',
});

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const title = 'Magasin';
    res.status(200).render('shop/shop', { title });
  } catch (err) {
    next(err);
  }
});

router.get('/produits', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const title = 'Produits';
    const store = res.locals.currentStore;
    const apiGetInventory = await apiInventory.get(`stores/${store.id}/inventory`);
    let inventory = apiGetInventory.data;
    await Promise.all(inventory.map(async (item: any) => {
        try {
            const response = await apiProducts.get(`products/${item.product_id}`);
            const categoryData = response.data;
            
            // Chercher le produit spécifique dans la catégorie
            if (categoryData.products && Array.isArray(categoryData.products)) {
                const foundProduct = categoryData.products.find((product: any) => product.id === item.product_id);
                if (foundProduct) {
                    item.productDetails = foundProduct;
                    item.name = foundProduct.name;
                    item.price = foundProduct.price;
                    item.category = foundProduct.category?.name;
                } else {
                    console.warn(`Produit avec ID ${item.product_id} non trouvé dans la catégorie ${categoryData.name}`);
                }
            }
        } catch (error) {
            console.error(`Erreur lors de la récupération du produit ${item.product_id}:`, error);
        }
    }));

    res.status(200).render('shop/products', { title, inventory });
  } catch (err) {
    next(err);
  }
});

router.get('/panier', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const title = 'Panier';
        const user = res.locals.currentUser;
        const panierResponse = await apiSales.get(`customers/${user.id}/shopping-carts`);
        const panier = panierResponse.data;
        res.status(200).render('shop/cart', { title, panier });
    } catch (err) {
        next(err);
    }
});


export default router;