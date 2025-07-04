import { AppDataSource } from './data-source';
import { Sale } from './entities/Sale';

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

async function seed() {
    await AppDataSource.initialize();
    await initSales();
    await AppDataSource.destroy();
    console.log('Seed terminé !');
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});