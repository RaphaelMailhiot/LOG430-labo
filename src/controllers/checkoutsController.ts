import {redis} from '../redisClient';
import {AppDataSource} from '../data-source';
import {Checkout} from '../entities/Checkout';

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