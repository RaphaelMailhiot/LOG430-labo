import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { initProducts } from './initData';
import mainMenu from './views/cli';

(async () => {
  await AppDataSource.initialize();
  await initProducts();
  console.log('🛒 Bienvenue dans l’application Magasin CLI');
  await mainMenu();
})();