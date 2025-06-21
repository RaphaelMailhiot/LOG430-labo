import { AppDataSource } from '../data-source';
import { Sale } from '../entities/Sale';
import { redis } from '../redisClient';

export class SalesController {
    async getAllSales() {
        const cacheKey = 'sales:all';
        try {
            const cached = await redis.get(cacheKey);
            if (cached) return JSON.parse(cached);
        } catch (err) {
            // Log l’erreur mais continue sans bloquer
            console.error('Erreur Redis (getAllSales):', err);
        }
        const saleRepo = AppDataSource.getRepository(Sale);
        const sales = await saleRepo.find();
        try {
            await redis.set(cacheKey, JSON.stringify(sales), 'EX', 300);
        } catch (err) {
            console.error('Erreur Redis (set getAllSales):', err);
        }
        return sales;
    }

    async getSaleByStore(storeId: number) {
        const cacheKey = `sales:store:${storeId}`;
        try {
            const cached = await redis.get(cacheKey);
            if (cached) return JSON.parse(cached);
        } catch (err) {
            console.error('Erreur Redis (getSaleByStore):', err);
        }
        const saleRepo = AppDataSource.getRepository(Sale);
        const sales = await saleRepo.findBy({ store: { id: storeId } });
        if (!sales) throw new Error(`No sales found for store ID ${storeId}`);
        try {
            await redis.set(cacheKey, JSON.stringify(sales), 'EX', 300);
        } catch (err) {
            console.error('Erreur Redis (set getSaleByStore):', err);
        }
        return sales;
    }

    async getSaleById(storeId: number, saleId: number) {
        const cacheKey = `sales:store:${storeId}:sale:${saleId}`;
        try {
            const cached = await redis.get(cacheKey);
            if (cached) return JSON.parse(cached);
        } catch (err) {
            console.error('Erreur Redis (getSaleById):', err);
        }
        const saleRepo = AppDataSource.getRepository(Sale);
        const sale = await saleRepo.findOne({
            where: { id: saleId, store: { id: storeId } },
        });
        if (!sale) throw new Error(`Sale with ID ${saleId} not found in store ${storeId}`);
        try {
            await redis.set(cacheKey, JSON.stringify(sale), 'EX', 300);
        } catch (err) {
            console.error('Erreur Redis (set getSaleById):', err);
        }
        return sale;
    }
}