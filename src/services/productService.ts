import { AppDataSource } from '../data-source';
import { Product } from '../entities/Product';
import { ILike } from 'typeorm';

/**
 * Recherche des produits par ID, nom ou catégorie.
 */
export const findProducts = async (search: string): Promise<Product[]> => {
  const repo = AppDataSource.getRepository(Product);
  const term = search.trim();
  if (!term) {
    return repo.find();
  }
  const id = Number(term);
  return repo.find({
    where: [
      { name: ILike(`%${term}%`) },
      { category: ILike(`%${term}%`) },
      ...(isNaN(id) ? [] : [{ id }])
    ]
  });
};

/**
 * Récupère un produit par son ID.
 */
export const getProductById = async (id: number): Promise<Product | null> => {
  const repo = AppDataSource.getRepository(Product);
  return repo.findOneBy({ id });
};

/**
 * Met à jour le stock d'un produit.
 */
export const updateStock = async (id: number, delta: number): Promise<void> => {
  const repo = AppDataSource.getRepository(Product);
  await repo.increment({ id }, 'stock', delta);
};