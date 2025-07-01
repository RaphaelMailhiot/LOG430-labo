import { AppDataSource } from '../data-source';
import { ShoppingCart } from '../entities/ShoppingCart';
import { ShoppingCartProduct } from '../entities/ShoppingCartProduct';
import {redis} from '../middleware/redisClient';

export class ShoppingCartsController {
    async getAllShoppingCarts() {
        const cacheKey = 'shoppingCarts:all';
        let cached: string | null = null;
        try {
            cached = await redis.get(cacheKey);
        } catch (err) {
            console.error('Redis error (getAllShoppingCarts):', err);
        }

        if (cached) {
            return JSON.parse(cached);
        }

        const shoppingCartRepo = AppDataSource.getRepository(ShoppingCart);
        const shoppingCarts = await shoppingCartRepo.find({ relations: ['customer', 'products.product'] });
        try {
            await redis.set(cacheKey, JSON.stringify(shoppingCarts), 'EX', 3600);
        } catch (err) {
            console.error('Redis error (set getAllShoppingCarts):', err);
        }

        return shoppingCarts;
    }

    async addProductToCart(productsId: number, body: any) {
        const shoppingCartRepo = AppDataSource.getRepository(ShoppingCart);
        const shoppingCart = await shoppingCartRepo.findOne({
            where: { customer_id: body.customerId }
        });
        if (!shoppingCart) {
            throw new Error('Shopping cart not found for the given customer');
        }
        const product = shoppingCart.products.find(p => p.product_id === productsId);
        if (product) {
            product.quantity += body.quantity;
        } else {
            const newProduct = shoppingCartRepo.manager.create(ShoppingCartProduct, {
                product: { id: productsId } as any, // Assuming product is fetched elsewhere
                quantity: body.quantity,
                cart: shoppingCart
            });
            shoppingCart.products.push(newProduct);
        }
        const updatedCart = await shoppingCartRepo.save(shoppingCart);
        try {
            await redis.del('shoppingCarts:all');
        } catch (err) {
            console.error('Redis error (del addProductToCart):', err);
        }
        return updatedCart;
    }
}