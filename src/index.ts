// index.ts
import { AppDataSource } from "./data-source";
import { SaleService } from "./controllers/saleService";

async function main() {
  // 1. Initialiser la connexion
  await AppDataSource.initialize();

  // 2. Instancier le service
  const saleService = new SaleService(AppDataSource);

  // 3. Appeler la méthode createSale
  try {
    const { saleId, total } = await saleService.createSale([
      { productId: 1, quantity: 2 },
      { productId: 3, quantity: 1 },
    ]);
    console.log(`Vente #${saleId} enregistrée (total : ${total} $)`);
  } catch (err: any) {
    console.error("Erreur lors de la vente :", err.message);
  } finally {
    await AppDataSource.destroy();
  }
}

main();

console.log("Hello World!LOG430-labo");