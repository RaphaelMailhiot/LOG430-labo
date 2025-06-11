// src/start.ts
import { AppDataSource } from './data-source';
import { initStores, initProducts } from './initData';
import { app } from './server';

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(async () => {
    console.log('✅ Connexion à la BDD réussie');
    await initStores();
    await initProducts();
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Erreur de connexion à la BDD :', error);
  });