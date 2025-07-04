import { AppDataSource } from './data-source';

AppDataSource.initialize().then(async () => {
    await AppDataSource.runMigrations();
    console.log('✅ Migrations applied');
    process.exit(0);
}).catch(error => {
    console.error('❌ Migration error:', error);
    process.exit(1);
});