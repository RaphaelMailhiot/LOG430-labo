import 'reflect-metadata';
import mainMenu from './views/cli';
import { AppDataSource } from './data-source';
import { initProducts } from './initData';

(async () => {
  await AppDataSource.initialize();
  await initProducts();
  console.log('🛒 Bienvenue dans l’application Magasin CLI');
  await mainMenu();
})();