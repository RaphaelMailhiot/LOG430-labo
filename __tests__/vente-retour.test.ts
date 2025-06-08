import { AppDataSource } from '../src/data-source';
import { Product } from '../src/entities/Product';
import { Store } from '../src/entities/Store';
import { Inventory } from '../src/entities/Inventory';
import { Sale } from '../src/entities/Sale';
import { SaleItem } from '../src/entities/SaleItem';
import { recordSale, cancelSale, findOldSales } from '../src/services/saleService';
import { addProduct, getStoreInventory } from '../src/services/productService';

describe('Simulation des services de vente', () => {
    let store: Store;
    let product: Product;

    beforeAll(async () => {
        await AppDataSource.initialize();

        // Création d'un magasin
        const storeRepo = AppDataSource.getRepository(Store);
        store = await storeRepo.save(storeRepo.create({ name: 'Magasin Test' }));

        // Ajout d'un produit via le service
        product = await addProduct({
            name: 'Produit Test',
            category: 'Catégorie Test',
            price: 10,
            stock: 20,
            storeId: store.id,
        });
    });

    afterAll(async () => {
        // Respecte l'ordre des dépendances (enfants -> parents)
        await AppDataSource.query('DELETE FROM "sale_item"');
        await AppDataSource.query('DELETE FROM "sale"');
        await AppDataSource.query('DELETE FROM "inventory"');
        await AppDataSource.query('DELETE FROM "product"');
        await AppDataSource.query('DELETE FROM "store"');
        await AppDataSource.destroy();
    });

    test('vente et retour de produit', async () => {
        // Vérifie le stock initial
        let inventory = await getStoreInventory(store.id);
        expect(inventory[0].stock).toBe(20);

        // Effectue une vente de 5 unités
        const saleId = await recordSale(
            [{ productId: product.id, quantity: 5, price: product.price }],
            store.id
        );

        // Vérifie le stock après vente
        inventory = await getStoreInventory(store.id);
        expect(inventory[0].stock).toBe(15);

        // Annule la vente
        await cancelSale(saleId, store.id);

        // Vérifie le stock après retour
        inventory = await getStoreInventory(store.id);
        expect(inventory[0].stock).toBe(20);

        // Vérifie que la vente n'est plus présente dans l'historique
        const ventes = await findOldSales(store.id);
        expect(ventes.length).toBe(0);
    });
});