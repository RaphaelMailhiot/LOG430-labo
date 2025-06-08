import { ILike } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Inventory } from '../entities/Inventory';
import { Product } from '../entities/Product';
import { Store } from '../entities/Store';

/**
 * Recherche des produits par ID, nom ou catégorie, pour un magasin donné.
 * Retourne les produits avec leur stock pour ce magasin.
 */
export const findProducts = async (search: string, storeId: number): Promise<any[]> => {
  const inventoryRepo = AppDataSource.getRepository(Inventory);
  const term = search.trim();
  let inventories;
  if (!term) {
    inventories = await inventoryRepo.find({
      where: { store: { id: storeId } },
      relations: ['product'],
    });
  } else {
    const id = Number(term);
    inventories = await inventoryRepo.find({
      where: [
        { product: { name: ILike(`%${term}%`) }, store: { id: storeId } },
        { product: { category: ILike(`%${term}%`) }, store: { id: storeId } },
        ...(isNaN(id) ? [] : [{ product: { id }, store: { id: storeId } }])
      ],
      relations: ['product'],
    });
  }
  // Retourne les infos produit + stock
  return inventories.map(inv => ({
    ...inv.product,
    stock: inv.stock,
    inventoryId: inv.id,
  }));
};

/**
 * Ajoute un nouveau produit global si besoin, puis crée l'entrée Inventory pour ce magasin.
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
  const productRepo = AppDataSource.getRepository(Product);
  const inventoryRepo = AppDataSource.getRepository(Inventory);
  // Vérifie si le produit existe déjà globalement (par nom/catégorie/prix)
  let product = await productRepo.findOneBy({ name, category, price });
  if (!product) {
    product = await productRepo.save(productRepo.create({ name, category, price }));
  }
  // Crée l'inventaire pour ce magasin
  const store = await AppDataSource.getRepository(Store).findOneByOrFail({ id: storeId });
  let inventory = await inventoryRepo.findOne({ where: { product: { id: product.id }, store: { id: storeId } } });
  if (!inventory) {
    inventory = inventoryRepo.create({ store, product, stock });
    await inventoryRepo.save(inventory);
  }
  return product;
};

/**
 * Récupère un produit global par son ID.
 */
export const getProductById = async (id: number): Promise<Product | null> => {
  const repo = AppDataSource.getRepository(Product);
  return repo.findOneBy({ id });
};

/**
 * Récupère le stock d'un produit pour un magasin donné.
 */
export const getStock = async (productId: number, storeId: number): Promise<number | null> => {
  const inventoryRepo = AppDataSource.getRepository(Inventory);
  const inventory = await inventoryRepo.findOne({ where: { product: { id: productId }, store: { id: storeId } } });
  return inventory ? inventory.stock : null;
};

/**
 * Met à jour le stock d'un produit pour un magasin donné.
 */
export const updateStock = async (productId: number, delta: number, storeId: number): Promise<void> => {
  const inventoryRepo = AppDataSource.getRepository(Inventory);
  const inventory = await inventoryRepo.findOneOrFail({ where: { product: { id: productId }, store: { id: storeId } } });
  inventory.stock += delta;
  await inventoryRepo.save(inventory);
};

/**
 * Retourne l'inventaire complet d'un magasin.
 */
export const getStoreInventory = async (storeId: number) => {
  const inventoryRepo = AppDataSource.getRepository(Inventory);
  return inventoryRepo.find({
    where: { store: { id: storeId } },
    relations: ['product'],
  });
};