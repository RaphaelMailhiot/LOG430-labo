import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { initProducts } from './initData';
import mainMenu from './views/cli';

(async () => {
  try {
    await mainMenu();
  } catch (err: any) {
    if (err.name === 'ExitPromptError') {
      // L'utilisateur a quitté le prompt, on termine proprement sans afficher l'erreur
      process.exit(0);
    }
    // Pour toute autre erreur, on l'affiche
    console.error(err);
    process.exit(1);
  }
})();