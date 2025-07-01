import { AppDataSource } from './data-source';
import { Customer } from './entities/Customer';
import { Manager } from './entities/Manager';

export async function initManagers() {
    const managerRepo = AppDataSource.getRepository(Manager);

    const managers = [
        { name: 'Admin', email: 'admin@admin.com', password: 'password', store_id: 1 },
        { name: 'Montréal', email: 'mtl@example.com', password: 'password' , store_id: 2 },
        { name: 'Québec', email: 'qc@example.com' , password: 'password', store_id: 3 },
        { name: 'SaintHyacinthe', email: 'sth@example.com' , password: 'password', store_id: 4 },
    ];

    for (const manager of managers) {
        const exists = await managerRepo.findOneBy({ email: manager.email });
        if (!exists) {
            await managerRepo.save(managerRepo.create(manager));
        }
    }
}

export async function initCustomers() {
    const customerRepo = AppDataSource.getRepository(Customer);

    const customers = [
        { name: 'Alice', email: 'alice@example.com', password: 'password', cart_id: 1 },
        { name: 'Bob', email: 'bob@example.com', password: 'password', cart_id: 2 },
        { name: 'Charlie', email: 'charlie@example.com', password: 'password', cart_id: 3 },
    ];

    for (const customer of customers) {
        const exists = await customerRepo.findOneBy({ email: customer.email });
        if (!exists) {
            await customerRepo.save(customerRepo.create(customer));
        }
    }
}

async function seed() {
    await AppDataSource.initialize();
    await initManagers();
    await initCustomers();
    await AppDataSource.destroy();
    console.log('Seed terminé !');
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});