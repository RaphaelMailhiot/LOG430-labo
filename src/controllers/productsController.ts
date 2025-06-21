import { AppDataSource } from '../data-source';
import { Inventory } from '../entities/Inventory';
import { Product } from '../entities/Product';
import { redis } from '../redisClient';

export class ProductsController {
    async getProducts() {
        const cacheKey = 'products:all';
        let cached: string | null = null;
        try {
            cached = await redis.get(cacheKey);
        } catch (err) {
            console.error('Erreur Redis (getProducts):', err);
        }
        if (cached) {
            return JSON.parse(cached);
        }
        const productRepo = AppDataSource.getRepository(Product);
        const products = await productRepo.find();
        try {
            await redis.set(cacheKey, JSON.stringify(products), 'EX', 300);
        } catch (err) {
            console.error('Erreur Redis (set getProducts):', err);
        }
        return products;
    }

    async getProductsPaginated({
                                   skip, take, category, sort,
                               }: {
        skip: number;
        take: number;
        category?: string;
        sort?: Record<string, 'ASC' | 'DESC'>;
    }) {
        const where: any = {};
        if (category) where.category = category;

        const cacheKey = `products:paginated:${JSON.stringify({ skip, take, category, sort })}`;
        let cached: string | null = null;
        try {
            cached = await redis.get(cacheKey);
        } catch (err) {
            console.error('Erreur Redis (getProductsPaginated):', err);
        }
        if (cached) {
            return JSON.parse(cached);
        }

        const [data, total] = await AppDataSource.getRepository(Product).findAndCount({
            where,
            order: sort,
            skip,
            take
        });

        try {
            await redis.set(cacheKey, JSON.stringify({ data, total }), 'EX', 300);
        } catch (err) {
            console.error('Erreur Redis (set getProductsPaginated):', err);
        }
        return { data, total };
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
        const inventoryRepo = AppDataSource.getRepository(Inventory);
        const inventory = await inventoryRepo.find({
            where: { store: { id: storeId } },
            relations: ['product'],
        });
        try {
            await redis.set(cacheKey, JSON.stringify(inventory), 'EX', 300);
        } catch (err) {
            console.error('Erreur Redis (set getStoreInventory):', err);
        }
        return inventory;
    };

    async getProductById(storeId: number, productId: number) {
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
        const inventoryRepo = AppDataSource.getRepository(Inventory);
        const inventoryItem = await inventoryRepo.findOne({
            where: {
                store: { id: storeId },
                product: { id: productId },
            },
            relations: ['product'],
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

    async updateProductById(
        storeId: number,
        productId: number,
        body: Partial<Product> & { stock?: number }
    ) {
        const inventoryRepo = AppDataSource.getRepository(Inventory);
        const productRepo = AppDataSource.getRepository(Product);

        const inventoryItem = await inventoryRepo.findOne({
            where: {
                store: { id: storeId },
                product: { id: productId },
            },
            relations: ['product'],
        });

        if (!inventoryItem) {
            throw new Error(`Product with ID ${productId} not found in store ${storeId}`);
        }

        if (body.name !== undefined || body.price !== undefined || body.category !== undefined) {
            const product = await productRepo.findOneBy({ id: productId });
            if (!product) {
                throw new Error(`Global product with ID ${productId} not found`);
            }
            if (body.name !== undefined) product.name = body.name;
            if (body.price !== undefined) product.price = body.price;
            if (body.category !== undefined) product.category = body.category;
            await productRepo.save(product);
            inventoryItem.product = product;
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