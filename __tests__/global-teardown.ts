import { AppDataSource } from '../src/data-source';

export default async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
};