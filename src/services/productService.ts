import { ILike } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Product } from '../entities/Product';

/**
 * Recherche des produits par ID, nom ou catégorie, pour un magasin donné.
 */
export const findProducts = async (search: string, storeId: number): Promise<Product[]> => {
  const repo = AppDataSource.getRepository(Product);
  const term = search.trim();
  if (!term) {
    return repo.find({ where: { store: { id: storeId } }, relations: ['store'] });
  }
  const id = Number(term);
  return repo.find({
    where: [
      { name: ILike(`%${term}%`), store: { id: storeId } },
      { category: ILike(`%${term}%`), store: { id: storeId } },
      ...(isNaN(id) ? [] : [{ id, store: { id: storeId } }])
    ],
    relations: ['store']
  });
};

/**
 * Ajoute un nouveau produit à la base de données pour un magasin donné.
 */
export const addProduct = async ({
  name,
  category,
  price,
  stock,
  storeId
}: {
  name: string;
  category: string;
  price: number;
  stock: number;
  storeId: number;
}): Promise<Product> => {
  const repo = AppDataSource.getRepository(Product);
  const produit = repo.create({ name, category, price, stock, store: { id: storeId } });
  return repo.save(produit);
};

/**
 * Récupère un produit par son ID et magasin.
 */
export const getProductById = async (id: number, storeId: number): Promise<Product | null> => {
  const repo = AppDataSource.getRepository(Product);
  return repo.findOne({
    where: { id, store: { id: storeId } },
    relations: ['store']
  });
};

/**
 * Met à jour le stock d'un produit pour un magasin donné.
 */
export const updateStock = async (id: number, delta: number, storeId: number): Promise<void> => {
  const repo = AppDataSource.getRepository(Product);
  await repo.increment({ id, store: { id: storeId } }, 'stock', delta);
};