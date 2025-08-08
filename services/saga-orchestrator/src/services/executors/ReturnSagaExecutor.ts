import axios from 'axios';
import { SagaStep, StepType } from '../../entities/SagaStep';
import { logger } from '../../middleware/logger';
import { SagaExecutor, SagaExecutionContext } from '../SagaExecutor';

export class ReturnSagaExecutor extends SagaExecutor {
  
  async executeStep(context: SagaExecutionContext): Promise<Record<string, any>> {
    const { currentStep, stepData } = context;
    
    switch (currentStep.type) {
      case StepType.VALIDATE_RETURN:
        return await this.validateReturn(stepData);
        
      case StepType.PROCESS_REFUND:
        return await this.processRefund(stepData);
        
      case StepType.RESTORE_INVENTORY:
        return await this.restoreInventory(stepData);
        
      case StepType.UPDATE_SALE:
        return await this.updateSale(stepData);
        
      default:
        throw new Error(`Type d'étape non supporté: ${currentStep.type}`);
    }
  }

  async compensateStep(context: SagaExecutionContext): Promise<void> {
    const { currentStep, stepData } = context;
    
    switch (currentStep.type) {
      case StepType.REVERSE_REFUND:
        await this.reverseRefund(stepData);
        break;
        
      case StepType.REVERSE_INVENTORY_RESTORE:
        await this.reverseInventoryRestore(stepData);
        break;
        
      case StepType.REVERSE_SALE_UPDATE:
        await this.reverseSaleUpdate(stepData);
        break;
        
      default:
        logger.warn(`Compensation non implémentée pour: ${currentStep.type}`);
    }
  }

  getNextStep(currentStep: SagaStep): SagaStep | null {
    return null; // Géré par l'orchestrateur
  }

  getCompensationStep(failedStep: SagaStep): SagaStep | null {
    const compensationMap: Record<StepType, StepType> = {
      [StepType.VALIDATE_RETURN]: StepType.REVERSE_REFUND,
      [StepType.PROCESS_REFUND]: StepType.REVERSE_REFUND,
      [StepType.RESTORE_INVENTORY]: StepType.REVERSE_INVENTORY_RESTORE,
      [StepType.UPDATE_SALE]: StepType.REVERSE_SALE_UPDATE,
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
  private async validateReturn(data: Record<string, any>): Promise<Record<string, any>> {
    try {
      const { sale_id, customer_id, items } = data;
      
      // Vérifier que la vente existe et appartient au client
      const saleResponse = await axios.get(`http://sales-service-1:3000/api/v1/sales/${sale_id}`);
      const sale = saleResponse.data.data;
      
      if (!sale || sale.customer_id !== customer_id) {
        throw new Error('Vente non trouvée ou non autorisée');
      }

      // Vérifier que les produits peuvent être retournés
      for (const item of items) {
        const productResponse = await axios.get(`http://products-service-1:3000/api/v1/products/${item.product_id}`);
        const product = productResponse.data.data;
        
        if (!product.returnable) {
          throw new Error(`Le produit ${item.product_id} n'est pas retournable`);
        }
      }

      logger.info(`Retour validé pour la vente ${sale_id}`);
      return { 
        sale_id, 
        customer_id, 
        validated_items: items,
        return_date: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Erreur lors de la validation du retour: ${error}`);
      throw error;
    }
  }

  private async processRefund(data: Record<string, any>): Promise<Record<string, any>> {
    try {
      const { sale_id, refund_amount, payment_id } = data;
      
      // Traiter le remboursement
      const refundResponse = await axios.post(`http://payment-service:3000/api/v1/payments/${payment_id}/refund`, {
        amount: refund_amount,
        reason: 'return',
        sale_id
      });

      logger.info(`Remboursement traité: ${refund_amount}€ pour la vente ${sale_id}`);
      return { 
        refund_id: refundResponse.data.refund_id,
        refund_amount,
        refund_date: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Erreur lors du traitement du remboursement: ${error}`);
      throw error;
    }
  }

  private async restoreInventory(data: Record<string, any>): Promise<Record<string, any>> {
    try {
      const { sale_id, items, store_id } = data;
      
      // Restaurer l'inventaire pour chaque produit
      for (const item of items) {
        await axios.patch('http://inventory-service-1:3000/api/v1/inventories', {
          store_id,
          product_id: item.product_id,
          stock: item.quantity // Restaurer le stock
        });
      }

      logger.info(`Inventaire restauré pour la vente ${sale_id}`);
      return { 
        restored_items: items,
        store_id,
        restore_date: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Erreur lors de la restauration de l'inventaire: ${error}`);
      throw error;
    }
  }

  private async updateSale(data: Record<string, any>): Promise<Record<string, any>> {
    try {
      const { sale_id, items, refund_amount } = data;
      
      // Mettre à jour la vente avec les informations de retour
      const updateResponse = await axios.patch(`http://sales-service-1:3000/api/v1/sales/${sale_id}`, {
        status: 'returned',
        return_items: items,
        refund_amount,
        return_date: new Date().toISOString()
      });

      logger.info(`Vente mise à jour: ${sale_id} marquée comme retournée`);
      return { 
        updated_sale_id: sale_id,
        return_status: 'completed'
      };
    } catch (error) {
      logger.error(`Erreur lors de la mise à jour de la vente: ${error}`);
      throw error;
    }
  }

  // Méthodes de compensation
  private async reverseRefund(data: Record<string, any>): Promise<void> {
    try {
      const { refund_id, refund_amount } = data;
      
      // Annuler le remboursement
      await axios.post(`http://payment-service:3000/api/v1/refunds/${refund_id}/reverse`, {
        amount: refund_amount
      });

      logger.info(`Remboursement annulé: ${refund_id}`);
    } catch (error) {
      logger.error(`Erreur lors de l'annulation du remboursement: ${error}`);
      throw error;
    }
  }

  private async reverseInventoryRestore(data: Record<string, any>): Promise<void> {
    try {
      const { restored_items, store_id } = data;
      
      // Annuler la restauration de l'inventaire
      for (const item of restored_items) {
        await axios.patch('http://inventory-service-1:3000/api/v1/inventories', {
          store_id,
          product_id: item.product_id,
          stock: -item.quantity // Diminuer le stock
        });
      }

      logger.info('Restauration d\'inventaire annulée');
    } catch (error) {
      logger.error(`Erreur lors de l'annulation de la restauration: ${error}`);
      throw error;
    }
  }

  private async reverseSaleUpdate(data: Record<string, any>): Promise<void> {
    try {
      const { updated_sale_id } = data;
      
      // Annuler la mise à jour de la vente
      await axios.patch(`http://sales-service-1:3000/api/v1/sales/${updated_sale_id}`, {
        status: 'completed',
        return_items: null,
        refund_amount: null,
        return_date: null
      });

      logger.info(`Mise à jour de vente annulée: ${updated_sale_id}`);
    } catch (error) {
      logger.error(`Erreur lors de l'annulation de la mise à jour: ${error}`);
      throw error;
    }
  }
} 