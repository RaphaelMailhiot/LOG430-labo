import {AppDataSource} from '../data-source';
import {Manager} from '../entities/Manager';
import {redis} from '../middleware/redisClient';

export class ManagersController {
    async getAllManagers() {
        const cacheKey = 'managers:all';
        let cached: string | null = null;
        try {
            cached = await redis.get(cacheKey);
        } catch (err) {
            console.error('Erreur Redis (getAllManagers):', err);
        }

        if (cached) {
            return JSON.parse(cached);
        }

        const managerRepo = AppDataSource.getRepository(Manager);
        const managers = await managerRepo.find();
        try {
            await redis.set(cacheKey, JSON.stringify(managers), 'EX', 3600);
        } catch (err) {
            console.error('Erreur Redis (set getAllManagers):', err);
        }

        return managers;
    }

    async createManager(body: any) {
        const managerRepo = AppDataSource.getRepository(Manager);
        const newManager = managerRepo.create(body);
        const savedManager = await managerRepo.save(newManager);

        // Invalider le cache pour tous les managers
        try {
            await redis.del('managers:all');
        } catch (err) {
            console.error('Erreur Redis (del createManager):', err);
        }

        return savedManager;
    }

    async getManagerById(managerId: number) {
        const cacheKey = `managers:${managerId}`;
        let cached: string | null = null;
        try {
            cached = await redis.get(cacheKey);
        } catch (err) {
            console.error('Erreur Redis (getManagerById):', err);
        }

        if (cached) {
            return JSON.parse(cached);
        }

        const managerRepo = AppDataSource.getRepository(Manager);
        const manager = await managerRepo.findOne({where: {id: managerId}});

        if (!manager) {
            throw new Error('Manager non trouvé');
        }

        try {
            await redis.set(cacheKey, JSON.stringify(manager), 'EX', 3600);
        } catch (err) {
            console.error('Erreur Redis (set getManagerById):', err);
        }

        return manager;
    }
}