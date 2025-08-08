import { AppDataSource } from './data-source';
import { Saga, SagaType, SagaStatus } from './entities/Saga';
import { SagaStep, StepType, StepStatus } from './entities/SagaStep';

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Base de données connectée pour le seed');
    
    const sagaRepository = AppDataSource.getRepository(Saga);
    const stepRepository = AppDataSource.getRepository(SagaStep);
    
    // Nettoyer les données existantes
    await stepRepository.clear();
    await sagaRepository.clear();
    
    // Créer des sagas d'exemple
    const exampleSagas = [
      {
        type: SagaType.PURCHASE_SAGA,
        status: SagaStatus.COMPLETED,
        data: {
          store_id: 1,
          customer_id: 123,
          items: [
            { product_id: 456, quantity: 2, price: 29.99 }
          ],
          payment_method: 'credit_card',
          amount: 59.98
        }
      },
      {
        type: SagaType.RETURN_SAGA,
        status: SagaStatus.COMPLETED,
        data: {
          sale_id: 789,
          customer_id: 123,
          items: [
            { product_id: 456, quantity: 1, reason: 'defective' }
          ],
          refund_amount: 29.99
        }
      }
    ];
    
    for (const sagaData of exampleSagas) {
      const saga = sagaRepository.create(sagaData);
      const savedSaga = await sagaRepository.save(saga);
      
      // Créer les étapes correspondantes
      const steps = createStepsForSaga(savedSaga);
      await stepRepository.save(steps);
      
      console.log(`✅ Saga créée: ${savedSaga.id} (${savedSaga.type})`);
    }
    
    await AppDataSource.destroy();
    console.log('✅ Seed terminé avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  }
}

function createStepsForSaga(saga: Saga): Partial<SagaStep>[] {
  const steps: Partial<SagaStep>[] = [];
  
  switch (saga.type) {
    case SagaType.PURCHASE_SAGA:
      steps.push(
        { saga_id: saga.id, step_order: 1, type: StepType.VALIDATE_INVENTORY, status: StepStatus.COMPLETED, input_data: saga.data },
        { saga_id: saga.id, step_order: 2, type: StepType.RESERVE_INVENTORY, status: StepStatus.COMPLETED, input_data: saga.data },
        { saga_id: saga.id, step_order: 3, type: StepType.PROCESS_PAYMENT, status: StepStatus.COMPLETED, input_data: saga.data },
        { saga_id: saga.id, step_order: 4, type: StepType.CREATE_SALE, status: StepStatus.COMPLETED, input_data: saga.data },
        { saga_id: saga.id, step_order: 5, type: StepType.UPDATE_INVENTORY, status: StepStatus.COMPLETED, input_data: saga.data }
      );
      break;
      
    case SagaType.RETURN_SAGA:
      steps.push(
        { saga_id: saga.id, step_order: 1, type: StepType.VALIDATE_RETURN, status: StepStatus.COMPLETED, input_data: saga.data },
        { saga_id: saga.id, step_order: 2, type: StepType.PROCESS_REFUND, status: StepStatus.COMPLETED, input_data: saga.data },
        { saga_id: saga.id, step_order: 3, type: StepType.RESTORE_INVENTORY, status: StepStatus.COMPLETED, input_data: saga.data },
        { saga_id: saga.id, step_order: 4, type: StepType.UPDATE_SALE, status: StepStatus.COMPLETED, input_data: saga.data }
      );
      break;
  }
  
  return steps;
}

seed(); 