import { AppDataSource } from './data-source';
import { initStores, initProducts } from './initData';

async function main() {
  await AppDataSource.initialize();
  await initStores();
  await initProducts();
  process.exit(0);
}

main();