import { AppDataSource } from '../data-source';
import { Product } from '../entities/Product';
import { Inventory } from '../entities/Inventory';

export class ProductsController {
    async getProducts() {
        const productRepo = AppDataSource.getRepository(Product);
        return await productRepo.find();
    }
    async getProductsPaginated({
        skip, take, category, sort,
    }: {
        skip: number;
        take: number;
        category?: string;
        sort?: Record<string, 'ASC' | 'DESC'>;
    }) {
        const where: any = {};
        if (category) where.category = category;

        const [data, total] = await AppDataSource.getRepository(Product).findAndCount({
            where,
            order: sort,
            skip,
            take
        });

        return { data, total };
    }

    async getStoreInventory(storeId: number) {
        const inventoryRepo = AppDataSource.getRepository(Inventory);
        return inventoryRepo.find({
            where: { store: { id: storeId } },
            relations: ['product'],
        });
    };

    async getProductById(storeId: number, productId: number) {
        const inventoryRepo = AppDataSource.getRepository(Inventory);
        const inventoryItem = await inventoryRepo.findOne({
            where: {
                store: { id: storeId },
                product: { id: productId },
            },
            relations: ['product'],
        });

        if (!inventoryItem) {
            throw new Error(`Product with ID ${productId} not found in store ${storeId}`);
        }

        return inventoryItem;
    }

    async updateProductById(
        storeId: number,
        productId: number,
        body: Partial<Product> & { stock?: number }
    ) {
        const inventoryRepo = AppDataSource.getRepository(Inventory);
        const productRepo = AppDataSource.getRepository(Product);

        // Find inventory item for the store and product
        const inventoryItem = await inventoryRepo.findOne({
            where: {
                store: { id: storeId },
                product: { id: productId },
            },
            relations: ['product'],
        });

        if (!inventoryItem) {
            throw new Error(`Product with ID ${productId} not found in store ${storeId}`);
        }

        // Update global product fields if provided
        if (body.name !== undefined || body.price !== undefined || body.category !== undefined) {
            const product = await productRepo.findOneBy({ id: productId });
            if (!product) {
                throw new Error(`Global product with ID ${productId} not found`);
            }
            if (body.name !== undefined) product.name = body.name;
            if (body.price !== undefined) product.price = body.price;
            if (body.category !== undefined) product.category = body.category;
            await productRepo.save(product);
            inventoryItem.product = product;
        }

        // Update inventory stock if provided
        if (body.stock !== undefined) {
            inventoryItem.stock = body.stock;
            await inventoryRepo.save(inventoryItem);
        }

        return inventoryItem;
    }
}