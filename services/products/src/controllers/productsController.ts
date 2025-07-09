import {AppDataSource} from '../data-source';
import {Category} from '../entities/Category';
import {Product} from '../entities/Product';
import {redis} from '../middleware/redisClient';

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

    async getProductsPaginated({skip, take, category, sort}: {
        skip: number;
        take: number;
        category?: string;
        sort?: Record<string, 'ASC' | 'DESC'>;
    }) {
        const where: any = {};
        if (category) where.category = category;

        const cacheKey = `products:paginated:${JSON.stringify({skip, take, category, sort})}`;
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
            await redis.set(cacheKey, JSON.stringify({data, total}), 'EX', 300);
        } catch (err) {
            console.error('Erreur Redis (set getProductsPaginated):', err);
        }
        return {data, total};
    }

    async getProductsByCategoryId(categoryId: number) {
        const cacheKey = `categories:${categoryId}:products`;
        let cached: string | null = null;
        try {
            cached = await redis.get(cacheKey);
        } catch (err) {
            console.error('Erreur Redis (getProductsByCategory):', err);
        }
        if (cached) {
            return JSON.parse(cached);
        }

        const categoryRepo = AppDataSource.getRepository(Category);
        const category = await categoryRepo.findOne({
            where: { id: categoryId },
            relations: ['products'],
        });

        if (!category) {
            throw new Error(`Category with ID ${categoryId} not found`);
        }

        try {
            await redis.set(cacheKey, JSON.stringify(category.products), 'EX', 300);
        } catch (err) {
            console.error('Erreur Redis (set getProductsByCategory):', err);
        }

        return category.products;
    }
}