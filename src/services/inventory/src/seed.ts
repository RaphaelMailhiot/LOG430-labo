import { AppDataSource } from './data-source';
import { Store } from './entities/Store';

export async function initStores() {
    const repo = AppDataSource.getRepository(Store);
    const count = await repo.count();
    if (count === 0) {
        await repo.save([
            repo.create({ id: 1, name: 'Maison mère', isMain: true }),
            repo.create({ id: 2, name: 'Magasin Montréal' }),
            repo.create({ id: 3, name: 'Magasin Québec' }),
            repo.create({ id: 4, name: 'Magasin Saint-Hyacinthe' }),
        ]);
    }
}

async function seed() {
    await AppDataSource.initialize();
    await initStores();
    await AppDataSource.destroy();
    console.log('Seed terminé !');
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});