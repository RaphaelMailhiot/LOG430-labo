import {AppDataSource} from '../data-source';
import {Checkout} from '../entities/Checkout';
import {redis} from '../middleware/redisClient';

export class CheckoutsController {
    async getAllCheckouts() {
        const cacheKey = 'checkouts:all';
        let cached: string | null = null;
        try {
            cached = await redis.get(cacheKey);
        } catch (err) {
            console.error('Erreur Redis (getAllCheckouts):', err);
        }
        if (cached) {
            return JSON.parse(cached);
        }
        const checkoutRepo = AppDataSource.getRepository(Checkout);
        const checkouts = await checkoutRepo.find();
        try {
            await redis.set(cacheKey, JSON.stringify(checkouts), 'EX', 300);
        } catch (err) {
            console.error('Erreur Redis (set getAllCheckouts):', err);
        }
        return checkouts;
    }

    async createCheckout(body: any) {
        const checkoutRepo = AppDataSource.getRepository(Checkout);
        const newCheckout = checkoutRepo.create(body);
        const savedCheckout = await checkoutRepo.save(newCheckout);
        // Invalider le cache pour tous les checkouts
        try {
            await redis.del('checkouts:all');
        } catch (err) {
            console.error('Erreur Redis (del createCheckout):', err);
        }
        return savedCheckout;
    }

    async getCheckoutById(checkoutId: number) {
        const cacheKey = `checkouts:${checkoutId}`;
        let cached: string | null = null;
        try {
            cached = await redis.get(cacheKey);
        } catch (err) {
            console.error('Erreur Redis (getCheckoutById):', err);
        }
        if (cached) {
            return JSON.parse(cached);
        }
        const checkoutRepo = AppDataSource.getRepository(Checkout);
        const checkout = checkoutRepo.findOne({ where: { id: checkoutId } });
        if (!checkout) {
            throw new Error(`Checkout with ID ${checkoutId} not found`);
        }
        try {
            await redis.set(cacheKey, JSON.stringify(checkout), 'EX', 300);
        } catch (err) {
            console.error('Erreur Redis (set getCheckoutById):', err);
        }
        return checkout;
    }
}