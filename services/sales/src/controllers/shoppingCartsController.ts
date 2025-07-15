import axios from 'axios';
import {AppDataSource} from '../data-source';
import {ShoppingCart} from '../entities/ShoppingCart';
import {ShoppingCartProduct} from '../entities/ShoppingCartProduct';
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
        const shoppingCarts = await shoppingCartRepo.find({relations: ['customer', 'products.product']});
        try {
            await redis.set(cacheKey, JSON.stringify(shoppingCarts), 'EX', 3600);
        } catch (err) {
            console.error('Redis error (set getAllShoppingCarts):', err);
        }

        return shoppingCarts;
    }

    async createShoppingCart(body: any) {
        const shoppingCartRepo = AppDataSource.getRepository(ShoppingCart);
        
        // Créer un nouveau panier
        const newCart = shoppingCartRepo.create({
            customer_id: body.customerId,
            products: [] // Initialiser avec un tableau vide
        });
        
        const savedCart = await shoppingCartRepo.save(newCart);
        
        // Invalider le cache
        try {
            await redis.del('shoppingCarts:all');
        } catch (err) {
            console.error('Redis error (del createShoppingCart):', err);
        }
        
        return savedCart;
    }

    async updateShoppingCart(cartId: number, body: any) {
        const shoppingCartRepo = AppDataSource.getRepository(ShoppingCart);
        const shoppingCart = await shoppingCartRepo.findOne({
            where: {id: cartId}
        });
        if (!shoppingCart) {
            throw new Error('Shopping cart not found');
        }
        shoppingCart.customer_id = body.customerId || shoppingCart.customer_id;
        await shoppingCartRepo.save(shoppingCart);
        try {
            await redis.del('shoppingCarts:all');
        } catch (err) {
            console.error('Redis error (del updateShoppingCart):', err);
        }
        return shoppingCart;
    }

    async getShoppingCartsByCustomerId(customerId: number) {
        const cacheKey = `shoppingCarts:customer:${customerId}`;
        let cached: string | null = null;
        try {
            cached = await redis.get(cacheKey);
        } catch (err) {
            console.error('Redis error (getShoppingCartsByCustomerId):', err);
        }

        if (cached) {
            return JSON.parse(cached);
        }

        const shoppingCartRepo = AppDataSource.getRepository(ShoppingCart);
        const shoppingCarts = await shoppingCartRepo.find({
            where: {customer_id: customerId}
        });

        if (!shoppingCarts.length) {
            throw new Error('No shopping carts found for this customer');
        }

        try {
            await redis.set(cacheKey, JSON.stringify(shoppingCarts), 'EX', 3600);
        } catch (err) {
            console.error('Redis error (set getShoppingCartsByCustomerId):', err);
        }

        return shoppingCarts;
    }

    async addProductToCart(productsId: number, body: any) {
        const shoppingCartRepo = AppDataSource.getRepository(ShoppingCart);
        const shoppingCart = await shoppingCartRepo.findOne({
            where: {customer_id: body.customerId}
        });
        if (!shoppingCart) {
            throw new Error('Shopping cart not found for the given customer');
        }

        // Récupère les infos du produit via axios
        const productRes = await axios.get(`http://kong:8000/products/api/v1/products/${productsId}`);
        const productData = productRes.data;

        const product = shoppingCart.products.find(p => p.product_id === productsId);
        if (product) {
            product.quantity += body.quantity;
        } else {
            const newProduct = shoppingCartRepo.manager.create(ShoppingCartProduct, {
                product_id: productsId,
                quantity: body.quantity,
                cart: shoppingCart,
                product: productData // Associe les infos du produit
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