import Redis from 'ioredis';
import { AppDataSource } from '../data-source';
import { Inventory } from '../entities/Inventory';
import { Product } from '../entities/Product';

const redis = new Redis({ host: 'redis' });

export class ProductsController {
    async getProducts() {
        const cacheKey = 'products:all';
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        const productRepo = AppDataSource.getRepository(Product);
        const products = await productRepo.find();
        await redis.set(cacheKey, JSON.stringify(products), 'EX', 300); // cache for 5 min
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
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        const [data, total] = await AppDataSource.getRepository(Product).findAndCount({
            where,
            order: sort,
            skip,
            take
        });

        await redis.set(cacheKey, JSON.stringify({ data, total }), 'EX', 300); // cache for 5 min
        return { data, total };
    }

    async getStoreInventory(storeId: number) {
        const cacheKey = `inventory:store:${storeId}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        const inventoryRepo = AppDataSource.getRepository(Inventory);
        const inventory = await inventoryRepo.find({
            where: { store: { id: storeId } },
            relations: ['product'],
        });
        await redis.set(cacheKey, JSON.stringify(inventory), 'EX', 300);
        return inventory;
    };

    async getProductById(storeId: number, productId: number) {
        const cacheKey = `inventory:store:${storeId}:product:${productId}`;
        const cached = await redis.get(cacheKey);
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

        return inventoryItem;
    }

    async updateProductById(
        storeId: number,
        productId: number,
        body: Partial<Product> & { stock?: number }
    ) {
        const inventoryRepo = AppDataSource.getRepository(Inventory);
        const productRepo = AppDataSource.getRepository(Product);

        // Find inventory item for the store and product
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

        // Update global product fields if provided
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

        // Update inventory stock if provided
        if (body.stock !== undefined) {
            inventoryItem.stock = body.stock;
            await inventoryRepo.save(inventoryItem);
        }

        // Invalidate Redis cache
        await redis.del(
            'products:all',
            `inventory:store:${storeId}`,
            `inventory:store:${storeId}:product:${productId}`
        );
        // Invalidate all paginated products cache
        const paginatedKeys = await redis.keys('products:paginated:*');
        if (paginatedKeys.length) {
            await redis.del(...paginatedKeys);
        }

        return inventoryItem;
    }
}