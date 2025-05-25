import 'reflect-metadata';
import mainMenu from './cli';

(async () => {
  console.log('🛒 Bienvenue dans l’application Magasin CLI');
  await mainMenu();
})();
