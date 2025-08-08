import axios from 'axios';
import { SagaStep, StepType } from '../../entities/SagaStep';
import { logger } from '../../middleware/logger';
import { SagaExecutor, SagaExecutionContext } from '../SagaExecutor';

export class PurchaseSagaExecutor extends SagaExecutor {

  async executeStep(context: SagaExecutionContext): Promise<Record<string, any>> {
    const { currentStep, stepData } = context;

    switch (currentStep.type) {
      case StepType.VALIDATE_INVENTORY:
        return await this.validateInventory(stepData);

      case StepType.RESERVE_INVENTORY:
        return await this.reserveInventory(stepData);

      case StepType.PROCESS_PAYMENT:
        return await this.processPayment(stepData);

      case StepType.CREATE_SALE:
        return await this.createSale(stepData);

      case StepType.UPDATE_INVENTORY:
        return await this.updateInventory(stepData);

      default:
        throw new Error(`Type d'étape non supporté: ${currentStep.type}`);
    }
  }

  async compensateStep(context: SagaExecutionContext): Promise<void> {
    const { currentStep, stepData } = context;

    switch (currentStep.type) {
      case StepType.RELEASE_INVENTORY:
        await this.releaseInventory(stepData);
        break;

      case StepType.REFUND_PAYMENT:
        await this.refundPayment(stepData);
        break;

      case StepType.CANCEL_SALE:
        await this.cancelSale(stepData);
        break;

      default:
        logger.warn(`Compensation non implémentée pour: ${currentStep.type}`);
    }
  }

  getNextStep(currentStep: SagaStep): SagaStep | null {
    // Logique pour déterminer la prochaine étape
    // Dans une saga orchestrée, c'est généralement l'étape suivante dans l'ordre
    return null; // Géré par l'orchestrateur
  }

  getCompensationStep(failedStep: SagaStep): SagaStep | null {
    // Mapping des étapes vers leurs compensations
    const compensationMap: Record<StepType, StepType> = {
      [StepType.VALIDATE_INVENTORY]: StepType.RELEASE_INVENTORY,
      [StepType.RESERVE_INVENTORY]: StepType.RELEASE_INVENTORY,
      [StepType.PROCESS_PAYMENT]: StepType.REFUND_PAYMENT,
      [StepType.CREATE_SALE]: StepType.CANCEL_SALE,
      [StepType.UPDATE_INVENTORY]: StepType.RELEASE_INVENTORY,
      // Autres mappings...
    } as Record<StepType, StepType>;

    const compensationType = compensationMap[failedStep.type];
    if (!compensationType) {
      return null;
    }

    return {
      ...failedStep,
      type: compensationType,
      status: 'pending' as any
    } as SagaStep;
  }

  // Méthodes d'exécution des étapes
  private async validateInventory(data: Record<string, any>): Promise<Record<string, any>> {
    try {
      const { store_id, product_id, quantity } = data;

      const response = await axios.get('http://inventory-service-1:3000/api/v1/inventories', {
        params: { store_id, product_id }
      });

      const inventory = response.data.data;
      if (!inventory || inventory.stock < quantity) {
        throw new Error(`Stock insuffisant: ${inventory?.stock || 0} < ${quantity}`);
      }

      logger.info(`Inventaire validé pour le produit ${product_id} dans le magasin ${store_id}`);
      return { inventory_id: inventory.id, available_stock: inventory.stock };
    } catch (error) {
      logger.error(`Erreur lors de la validation de l'inventaire: ${error}`);
      throw error;
    }
  }

  private async reserveInventory(data: Record<string, any>): Promise<Record<string, any>> {
    try {
      const { store_id, product_id, quantity } = data;

      const response = await axios.patch('http://inventory-service-1:3000/api/v1/inventories', {
        store_id,
        product_id,
        stock: -quantity // Réserver en diminuant le stock
      });

      logger.info(`Inventaire réservé: ${quantity} unités du produit ${product_id}`);
      return { reserved_quantity: quantity };
    } catch (error) {
      logger.error(`Erreur lors de la réservation de l'inventaire: ${error}`);
      throw error;
    }
  }

  private async processPayment(data: Record<string, any>): Promise<Record<string, any>> {
    try {
      const { amount, payment_method, customer_id } = data;

      // Simulation d'un appel au service de paiement
      const paymentResponse = await axios.post('http://payment-service:3000/api/v1/payments', {
        amount,
        payment_method,
        customer_id,
        description: 'Achat en ligne'
      });

      logger.info(`Paiement traité: ${amount}€ pour le client ${customer_id}`);
      return {
        payment_id: paymentResponse.data.payment_id,
        transaction_id: paymentResponse.data.transaction_id
      };
    } catch (error) {
      logger.error(`Erreur lors du traitement du paiement: ${error}`);
      throw error;
    }
  }

  private async createSale(data: Record<string, any>): Promise<Record<string, any>> {
    try {
      const { store_id, customer_id, items, payment_id } = data;

      const response = await axios.post('http://sales-service-1:3000/api/v1/sales', {
        store_id,
        customer_id,
        items,
        payment_id
      });

      logger.info(`Vente créée: ${response.data.sale_id}`);
      return { sale_id: response.data.sale_id };
    } catch (error) {
      logger.error(`Erreur lors de la création de la vente: ${error}`);
      throw error;
    }
  }

  private async updateInventory(data: Record<string, any>): Promise<Record<string, any>> {
    try {
      const { store_id, product_id, quantity } = data;

      // Mise à jour finale de l'inventaire (confirmation de la vente)
      await axios.patch('http://inventory-service-1:3000/api/v1/inventories', {
        store_id,
        product_id,
        stock: -quantity
      });

      logger.info(`Inventaire mis à jour: ${quantity} unités vendues du produit ${product_id}`);
      return { final_stock_update: true };
    } catch (error) {
      logger.error(`Erreur lors de la mise à jour de l'inventaire: ${error}`);
      throw error;
    }
  }

  // Méthodes de compensation
  private async releaseInventory(data: Record<string, any>): Promise<void> {
    try {
      const { store_id, product_id, quantity } = data;

      await axios.patch('http://inventory-service-1:3000/api/v1/inventories', {
        store_id,
        product_id,
        stock: quantity // Restaurer le stock
      });

      logger.info(`Inventaire libéré: ${quantity} unités du produit ${product_id}`);
    } catch (error) {
      logger.error(`Erreur lors de la libération de l'inventaire: ${error}`);
      throw error;
    }
  }

  private async refundPayment(data: Record<string, any>): Promise<void> {
    try {
      const { payment_id, amount } = data;

      await axios.post(`http://payment-service:3000/api/v1/payments/${payment_id}/refund`, {
        amount
      });

      logger.info(`Remboursement effectué: ${amount}€ pour le paiement ${payment_id}`);
    } catch (error) {
      logger.error(`Erreur lors du remboursement: ${error}`);
      throw error;
    }
  }

  private async cancelSale(data: Record<string, any>): Promise<void> {
    try {
      const { sale_id } = data;

      await axios.delete(`http://sales-service-1:3000/api/v1/sales/${sale_id}`);

      logger.info(`Vente annulée: ${sale_id}`);
    } catch (error) {
      logger.error(`Erreur lors de l'annulation de la vente: ${error}`);
      throw error;
    }
  }
} 