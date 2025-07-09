import { AppDataSource } from './data-source';
import { Category } from './entities/Category';
import { Product } from './entities/Product';

export async function initCategories() {
    const categoryRepo = AppDataSource.getRepository(Category);

    const baseCategories = [
        { name: 'Informatique' },
        { name: 'Accessoires' },
        { name: 'Audio' },
    ];

    const count = await categoryRepo.count();
    if (count === 0) {
        for (const base of baseCategories) {
            await categoryRepo.save(categoryRepo.create(base));
        }
    }
}

export async function initProducts() {
    const categoryRepo = AppDataSource.getRepository(Category);
    const productRepo = AppDataSource.getRepository(Product);

    const baseProducts = [
        { name: 'Clavier', category: 'Informatique', price: 49.99 },
        { name: 'Souris', category: 'Informatique', price: 19.99 },
        { name: 'Écran', category: 'Informatique', price: 199.99 },
        { name: 'Câble HDMI', category: 'Accessoires', price: 9.99 },
        { name: 'Casque audio', category: 'Audio', price: 59.99 },
    ];

    const count = await productRepo.count();
    if (count === 0) {
        for (const base of baseProducts) {
            const category = await categoryRepo.findOneBy({ name: base.category });
            if (!category) continue; // Ignore si la catégorie n'existe pas
            const product = productRepo.create({
                name: base.name,
                price: base.price,
                category: category,
            });
            await productRepo.save(product);
        }
    }
}

async function seed() {
    await AppDataSource.initialize();
    await initCategories();
    await initProducts();
    await AppDataSource.destroy();
    console.log('Seed terminé !');
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});