import { AppDataSource } from '../data-source';
import { InventoryProduct } from '../entities/InventoryProduct';
import { SupplyRequest } from '../entities/SupplyRequest';
import { redis } from '../middleware/redisClient';

export class SupplyRequestsController {
    getAllSupplyRequests = async () => {
        const cacheKey = 'supplyRequests:all';
        let cached: string | null = null;
        try {
            cached = await redis.get(cacheKey);
        } catch (err) {
            console.error('Erreur Redis (getSupplyRequests):', err);
        }
        if (cached) {
            return JSON.parse(cached);
        }
        const supplyRequestRepo = AppDataSource.getRepository(SupplyRequest);
        const supplyRequests = await supplyRequestRepo.find({
            relations: ['product'],
        });
        try {
            await redis.set(cacheKey, JSON.stringify(supplyRequests), 'EX', 300);
        } catch (err) {
            console.error('Erreur Redis (set getSupplyRequests):', err);
        }
        return supplyRequests;
    };

    getSupplyRequestsByStoreId = async (storeId: number) => {
        const cacheKey = `supplyRequests:store:${storeId}`;
        let cached: string | null = null;
        try {
            cached = await redis.get(cacheKey);
        } catch (err) {
            console.error('Erreur Redis (getSupplyRequestsByStoreId):', err);
        }
        if (cached) {
            return JSON.parse(cached);
        }
        const supplyRequestRepo = AppDataSource.getRepository(SupplyRequest);
        const supplyRequests = await supplyRequestRepo.find({
            where: { store_id: storeId },
            relations: ['product'],
        });
        try {
            await redis.set(cacheKey, JSON.stringify(supplyRequests), 'EX', 300);
        } catch (err) {
            console.error('Erreur Redis (set getSupplyRequestsByStoreId):', err);
        }
        return supplyRequests;
    };

    createSupplyRequest = async (body: any) => {
        const supplyRequestRepo = AppDataSource.getRepository(SupplyRequest);
        const inventoryProductRepo = AppDataSource.getRepository(InventoryProduct);
        const { store_id, product_id, quantity } = body;

        const product = await inventoryProductRepo.findOneBy({ id: product_id });
        if (!product) {
            throw new Error('Produit non trouvé');
        }

        const newSupplyRequest = supplyRequestRepo.create({
            store_id,
            product,
            quantity,
        });
        const savedSupplyRequest = await supplyRequestRepo.save(newSupplyRequest);

        try {
            await redis.del('supplyRequests:all');
        } catch (err) {
            console.error('Erreur Redis (del createSupplyRequest):', err);
        }

        return savedSupplyRequest;
    };
}