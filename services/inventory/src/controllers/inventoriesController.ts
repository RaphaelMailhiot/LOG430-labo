import {AppDataSource} from '../data-source';
import {InventoryProduct} from '../entities/InventoryProduct';
import {redis} from '../middleware/redisClient';

export class InventoriesController {
    async getInventories() {
        const cacheKey = 'inventories:all';
        let cached: string | null = null;
        try {
            cached = await redis.get(cacheKey);
        } catch (err) {
            console.error('Erreur Redis (getInventories):', err);
        }
        if (cached) {
            return JSON.parse(cached);
        }
        const inventoryRepo = AppDataSource.getRepository(InventoryProduct);
        const inventories = await inventoryRepo.find();
        try {
            await redis.set(cacheKey, JSON.stringify(inventories), 'EX', 300);
        } catch (err) {
            console.error('Erreur Redis (set getInventories):', err);
        }
        return inventories;
    }

    async getStoreInventory(storeId: number) {
        const cacheKey = `inventory:store:${storeId}`;
        let cached: string | null = null;
        try {
            cached = await redis.get(cacheKey);
        } catch (err) {
            console.error('Erreur Redis (getStoreInventory):', err);
        }
        if (cached) {
            return JSON.parse(cached);
        }
        const inventoryRepo = AppDataSource.getRepository(InventoryProduct);
        const inventory = await inventoryRepo.find({
            where: {storeId: storeId},
        });
        try {
            await redis.set(cacheKey, JSON.stringify(inventory), 'EX', 300);
        } catch (err) {
            console.error('Erreur Redis (set getStoreInventory):', err);
        }
        return inventory;
    };

    async getStoreInventoryProductId(storeId: number, productId: number) {
        const cacheKey = `inventory:store:${storeId}:product:${productId}`;
        let cached: string | null = null;
        try {
            cached = await redis.get(cacheKey);
        } catch (err) {
            console.error('Erreur Redis (getProductById):', err);
        }
        if (cached) {
            return JSON.parse(cached);
        }
        const inventoryRepo = AppDataSource.getRepository(InventoryProduct);
        const inventoryItem = await inventoryRepo.findOne({
            where: {
                storeId: storeId,
                productId: productId,
            },
        });

        if (!inventoryItem) {
            throw new Error(`Product with ID ${productId} not found in store ${storeId}`);
        }

        try {
            await redis.set(cacheKey, JSON.stringify(inventoryItem), 'EX', 300);
        } catch (err) {
            console.error('Erreur Redis (set getProductById):', err);
        }

        return inventoryItem;
    }

    async updateStoreInventoryProductId(
        storeId: number,
        productId: number,
        body: { stock?: number }
    ) {
        const inventoryRepo = AppDataSource.getRepository(InventoryProduct);

        if (body.stock !== undefined && body.stock <= 0) {
            throw new Error('Le stock doit être un nombre positif ou nul');
        }

        const inventoryItem = await inventoryRepo.findOne({
            where: { storeId, productId },
        });

        if (!inventoryItem) {
            throw new Error(`Produit ${productId} introuvable dans le magasin ${storeId}`);
        }

        if (body.stock !== undefined) {
            inventoryItem.stock = body.stock;
            await inventoryRepo.save(inventoryItem);
        }

        // Invalidation du cache Redis
        try {
            await redis.del(
                'products:all',
                `inventory:store:${storeId}`,
                `inventory:store:${storeId}:product:${productId}`
            );
            const paginatedKeys = await redis.keys('products:paginated:*');
            if (paginatedKeys.length) {
                await redis.del(...paginatedKeys);
            }
        } catch (err) {
            console.error('Erreur Redis (del updateProductById):', err);
        }

        return inventoryItem;
    }
}