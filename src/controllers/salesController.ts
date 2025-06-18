import { AppDataSource } from '../data-source';
import { Sale } from '../entities/Sale';
import Redis from 'ioredis';

const redis = new Redis({ host: 'redis' });

export class SalesController {
    async getAllSales() {
        const cacheKey = 'sales:all';
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        const saleRepo = AppDataSource.getRepository(Sale);
        const sales = await saleRepo.find();
        await redis.set(cacheKey, JSON.stringify(sales), 'EX', 300); // cache for 5 min
        return sales;
    }

    async getSaleByStore(storeId: number) {
        const cacheKey = `sales:store:${storeId}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        const saleRepo = AppDataSource.getRepository(Sale);
        const sales = await saleRepo.findBy({ store: { id: storeId } });
        if (!sales) {
            throw new Error(`No sales found for store ID ${storeId}`);
        }
        await redis.set(cacheKey, JSON.stringify(sales), 'EX', 300);
        return sales;
    }

    async getSaleById(storeId: number, saleId: number) {
        const cacheKey = `sales:store:${storeId}:sale:${saleId}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        const saleRepo = AppDataSource.getRepository(Sale);
        const sale = await saleRepo.findOne({
            where: {
                id: saleId,
                store: { id: storeId },
            },
        });

        if (!sale) {
            throw new Error(`Sale with ID ${saleId} not found in store ${storeId}`);
        }

        await redis.set(cacheKey, JSON.stringify(sale), 'EX', 300);
        return sale;
    }
}