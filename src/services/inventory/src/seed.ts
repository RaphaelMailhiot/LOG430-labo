import { AppDataSource } from './data-source';
import { InventoryProduct } from './entities/InventoryProduct';

export async function initInventoryProducts() {
    const inventoryProductRepo = AppDataSource.getRepository(InventoryProduct);

    const mainStoreBaseInventoryProducts = [
        { storeId: 1, productId: 1, stock: 100 },
        { storeId: 1, productId: 2, stock: 100 },
        { storeId: 1, productId: 3, stock: 100 },
        { storeId: 1, productId: 4, stock: 100 },
        { storeId: 1, productId: 5, stock: 100 },
    ];

    const storesBaseInventoryProducts = [
        { productId: 1, stock: 10 },
        { productId: 2, stock: 12 },
        { productId: 3, stock: 14 },
        { productId: 4, stock: 16 },
        { productId: 5, stock: 18 },
    ];

    const count = await inventoryProductRepo.count();
    if (count === 0) {
        for (const base of mainStoreBaseInventoryProducts) {
            const inventoryProduct = inventoryProductRepo.create({
                storeId: base.storeId,
                productId: base.productId,
                stock: base.stock,
            });
            await inventoryProductRepo.save(inventoryProduct);
        }
        // Ajouter des produits pour les autres magasins (2 à 4)
        for (let i = 2; i <= 4; i++) {
            for (const base of storesBaseInventoryProducts) {
                const inventoryProduct = inventoryProductRepo.create({
                    storeId: i,
                    productId: base.productId,
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