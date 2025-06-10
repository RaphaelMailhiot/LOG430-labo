import { AppDataSource } from '../data-source';
import { Sale } from '../entities/Sale';

export class SalesController {
    async getAllSales() {
        const saleRepo = AppDataSource.getRepository(Sale);
        return await saleRepo.find();
    }

    async getSaleByStore(storeId: number) {
        const saleRepo = AppDataSource.getRepository(Sale);
        const sales = await saleRepo.findBy({ store: { id: storeId } });
        if (!sales) {
            throw new Error(`No sales found for store ID ${storeId}`);
        }
        return sales;
    }

    async getSaleById(storeId: number, saleId: number) {
        const saleRepo = AppDataSource.getRepository(Sale);
        const sale = await saleRepo.findOne({
            where: {
                id: saleId,
                store: { id: storeId },
            },
        });

        if (!sale) {
            throw new Error(`Sale with ID ${saleId} not found in store ${storeId}`);
        }

        return sale;
    }
}