import {AppDataSource} from '../data-source';
import {Customer} from '../entities/Customer';
import {Manager} from '../entities/Manager';
import {redis} from '../middleware/redisClient';

export class UsersController {
    async getAllUsers() {
        const cacheKey = 'users:all';
        let cached: string | null = null;
        try {
            cached = await redis.get(cacheKey);
        } catch (err) {
            console.error('Erreur Redis (getAllUsers):', err);
        }

        if (cached) {
            return JSON.parse(cached);
        }

        const managerRepo = AppDataSource.getRepository(Manager);
        const cutomerRepo = AppDataSource.getRepository(Customer);
        const managers = await managerRepo.find();
        const cutomers = await cutomerRepo.find();
        const users = [...managers, ...cutomers];
        try {
            await redis.set(cacheKey, JSON.stringify(users), 'EX', 3600);
        } catch (err) {
            console.error('Erreur Redis (set getAllUsers):', err);
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return users.map(({password, ...u}) => u);
    }

    async getUserConnection(userEmail: string, userPassword: string) {
        const cacheKey = 'users:connection';
        let cached: string | null = null;
        try {
            cached = await redis.get(cacheKey);
        } catch (err) {
            console.error('Erreur Redis (getUserConnection):', err);
        }

        if (cached) {
            return JSON.parse(cached);
        }

        const managerRepo = AppDataSource.getRepository(Manager);
        const manager = await managerRepo.findOne({where: {email: userEmail, password: userPassword}});
        if (manager) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...managerWithoutPassword } = manager;
            return managerWithoutPassword;
        }

        const cutomerRepo = AppDataSource.getRepository(Customer);
        const cutomer = await cutomerRepo.findOne({where: {email: userEmail, password: userPassword}});
        if (cutomer) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...cutomerWithoutPassword } = cutomer;
            return cutomerWithoutPassword;
        }

        return false;
    }
}