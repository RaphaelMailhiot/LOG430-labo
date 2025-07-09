import { AppDataSource } from '../data-source';
import {Category} from '../entities/Category';
import {redis} from '../middleware/redisClient';

export class CategoriesController {
    async getAllCategories() {
        const cacheKey = 'categories:all';
        let cached: string | null = null;
        try {
            cached = await redis.get(cacheKey);
        } catch (err) {
            console.error('Erreur Redis (getCategories):', err);
        }
        if (cached) {
            return JSON.parse(cached);
        }

        const categoryRepo = AppDataSource.getRepository(Category);
        const categories = await categoryRepo.find();
        try {
            await redis.set(cacheKey, JSON.stringify(categories), 'EX', 300);
        } catch (err) {
            console.error('Erreur Redis (set getCategories):', err);
        }
        return categories;
    }

    async getCategoriesById(id: number) {
        const cacheKey = `categories:${id}`;
        let cached: string | null = null;
        try {
            cached = await redis.get(cacheKey);
        } catch (err) {
            console.error('Erreur Redis (getCategoriesById):', err);
        }

        if (cached) {
            return JSON.parse(cached);
        }

        const categoryRepo = AppDataSource.getRepository(Category);
        const category = await categoryRepo.findOne({ where: { id } });

        if (!category) {
            throw new Error(`Category with ID ${id} not found`);
        }

        try {
            await redis.set(cacheKey, JSON.stringify(category), 'EX', 300);
        } catch (err) {
            console.error('Erreur Redis (set getCategoriesById):', err);
        }

        return category;
    }

    async getCategoryByProductId(productId: number) {
        const cacheKey = `categories:product:${productId}`;
        let cached: string | null = null;
        try {
            cached = await redis.get(cacheKey);
        } catch (err) {
            console.error('Erreur Redis (getCategoryByProductId):', err);
        }

        if (cached) {
            return JSON.parse(cached);
        }

        const categoryRepo = AppDataSource.getRepository(Category);
        const category = await categoryRepo.findOne({ where: { products: { id: productId } } });

        if (!category) {
            throw new Error(`Category for product ID ${productId} not found`);
        }

        try {
            await redis.set(cacheKey, JSON.stringify(category), 'EX', 300);
        } catch (err) {
            console.error('Erreur Redis (set getCategoryByProductId):', err);
        }

        return category;
    }

    async createCategory(body: any) {
        const categoryRepo = AppDataSource.getRepository(Category);
        const newCategory = categoryRepo.create(body);
        const savedCategory = await categoryRepo.save(newCategory);

        // Invalidate the cache for all categories
        try {
            await redis.del('categories:all');
        } catch (err) {
            console.error('Erreur Redis (del createCategory):', err);
        }

        return savedCategory;
    }
}