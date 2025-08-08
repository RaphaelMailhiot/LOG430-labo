import { AppDataSource } from './data-source';

async function runMigrations() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Base de données connectée pour les migrations');
    
    const migrations = await AppDataSource.runMigrations();
    console.log(`✅ ${migrations.length} migration(s) exécutée(s)`);
    
    await AppDataSource.destroy();
    console.log('✅ Connexion fermée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors des migrations:', error);
    process.exit(1);
  }
}

runMigrations(); 