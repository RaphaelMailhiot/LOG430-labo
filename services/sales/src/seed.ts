import { AppDataSource } from './data-source';
import { Sale } from './entities/Sale';
import { ShoppingCart } from './entities/ShoppingCart';

export async function initSales() {
    const saleRepo = AppDataSource.getRepository(Sale);

    const baseSale = [
        { store_id: 1, items: [] },
        { store_id: 2, items: [] },
        { store_id: 3, items: [] },
        { store_id: 4, items: [] },
    ];

    const count = await saleRepo.count();
    if (count === 0) {
        for (const base of baseSale) {
            const sale = saleRepo.create({
                store_id: base.store_id,
                items: base.items,
            });
            await saleRepo.save(sale);
        }
    }
}

export async function initCarts() {
    const cartRepo = AppDataSource.getRepository(ShoppingCart);

    const customerIds = [1, 2, 3]; // Alice, Bob, Charlie

    for (const customer_id of customerIds) {
        const cart = cartRepo.create({
            customer_id,
            products: [],
        });
        await cartRepo.save(cart);
    }
}

async function seed() {
    await AppDataSource.initialize();
    await initSales();
    await initCarts();
    await AppDataSource.destroy();
    console.log('Seed terminé !');
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});