import { AppDataSource } from './data-source';
import { InventoryProduct } from './entities/InventoryProduct';

export async function initInventoryProducts() {
    const inventoryProductRepo = AppDataSource.getRepository(InventoryProduct);

    const mainStoreBaseInventoryProducts = [
        { store_id: 1, product_id: 1, stock: 100 },
        { store_id: 1, product_id: 2, stock: 100 },
        { store_id: 1, product_id: 3, stock: 100 },
        { store_id: 1, product_id: 4, stock: 100 },
        { store_id: 1, product_id: 5, stock: 100 },
    ];

    const storesBaseInventoryProducts = [
        { product_id: 1, stock: 10 },
        { product_id: 2, stock: 12 },
        { product_id: 3, stock: 14 },
        { product_id: 4, stock: 16 },
        { product_id: 5, stock: 18 },
    ];

    const count = await inventoryProductRepo.count();
    if (count === 0) {
        for (const base of mainStoreBaseInventoryProducts) {
            const inventoryProduct = inventoryProductRepo.create({
                store_id: base.store_id,
                product_id: base.product_id,
                stock: base.stock,
            });
            await inventoryProductRepo.save(inventoryProduct);
        }
        // Ajouter des produits pour les autres magasins (2 à 4)
        for (let i = 2; i <= 4; i++) {
            for (const base of storesBaseInventoryProducts) {
                const inventoryProduct = inventoryProductRepo.create({
                    store_id: i,
                    product_id: base.product_id,
                    stock: base.stock,
                });
                await inventoryProductRepo.save(inventoryProduct);
            }
        }
    }
}

async function seed() {
    await AppDataSource.initialize();
    await initInventoryProducts();
    await AppDataSource.destroy();
    console.log('Seed terminé !');
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});