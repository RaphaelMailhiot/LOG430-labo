import axios from 'axios';
import {AppDataSource} from '../data-source';
import {Customer} from '../entities/Customer';
import {redis} from '../middleware/redisClient';

export class CustomersController {
    async getAllCustomers() {
        const cacheKey = 'customers:all';
        let cached: string | null = null;
        try {
            cached = await redis.get(cacheKey);
        } catch (err) {
            console.error('Erreur Redis (getAllCustomers):', err);
        }

        if (cached) {
            return JSON.parse(cached);
        }

        const customerRepo = AppDataSource.getRepository(Customer);
        const customers = await customerRepo.find();
        try {
            await redis.set(cacheKey, JSON.stringify(customers), 'EX', 3600);
        } catch (err) {
            console.error('Erreur Redis (set getAllCustomers):', err);
        }

        return customers;
    }

    async createCustomer(body: any) {

        const apiCreateShoppingCart = await axios.post('http://kong:8000/sales/api/v1/shopping-carts', {
            ...body,
            customerId: null // will be set after customer creation
        });
        const shoppingCart = apiCreateShoppingCart.data;

        const customerRepo = AppDataSource.getRepository(Customer);
        const newCustomer = customerRepo.create({ ...body, cart_id: shoppingCart.id });
        const savedCustomer = await customerRepo.save(newCustomer);

        // If save returns an array, use the first element
        const customerObj = Array.isArray(savedCustomer) ? savedCustomer[0] : savedCustomer;

        // Update the shopping cart with the customer ID
        await axios.put(`http://kong:8000/sales/api/v1/shopping-carts/${shoppingCart.id}`, {
            customer_id: customerObj.id
        });

        // Invalider le cache pour tous les clients
        try {
            await redis.del('customers:all');
        } catch (err) {
            console.error('Erreur Redis (del createCustomer):', err);
        }
        try {
            await redis.del('shoppingCarts:all');
        } catch (err) {
            console.error('Erreur Redis (del createCustomer):', err);
        }

        return savedCustomer;
    }

    async getCustomerById(customerId: number) {
        const cacheKey = `customers:${customerId}`;
        let cached: string | null = null;
        try {
            cached = await redis.get(cacheKey);
        } catch (err) {
            console.error('Erreur Redis (getCustomerById):', err);
        }

        if (cached) {
            return JSON.parse(cached);
        }

        const customerRepo = AppDataSource.getRepository(Customer);
        const customer = await customerRepo.findOne({where: {id: customerId}});

        if (!customer) {
            throw new Error('Customer non trouvé');
        }

        try {
            await redis.set(cacheKey, JSON.stringify(customer), 'EX', 3600);
        } catch (err) {
            console.error('Erreur Redis (set getCustomerById):', err);
        }

        return customer;
    }
}