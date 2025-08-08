import { Repository } from 'typeorm';
import { SagaExecutor, SagaExecutionContext } from './SagaExecutor';
import { Saga, SagaStatus, SagaType } from '../entities/Saga';
import { SagaStep, StepStatus, StepType } from '../entities/SagaStep';
import { PurchaseSagaExecutor } from './executors/PurchaseSagaExecutor';
import { ReturnSagaExecutor } from './executors/ReturnSagaExecutor';
import { logger } from '../middleware/logger';

export class SagaOrchestratorService {
  private sagaRepository: Repository<Saga>;
  private stepRepository: Repository<SagaStep>;
  private executors: Map<SagaType, SagaExecutor>;

  constructor(
    sagaRepository: Repository<Saga>,
    stepRepository: Repository<SagaStep>
  ) {
    this.sagaRepository = sagaRepository;
    this.stepRepository = stepRepository;
    this.executors = new Map();
    
    // Initialiser les exécuteurs de saga
    this.initializeExecutors();
  }

  private initializeExecutors(): void {
    this.executors.set(SagaType.PURCHASE_SAGA, new PurchaseSagaExecutor());
    this.executors.set(SagaType.RETURN_SAGA, new ReturnSagaExecutor());
  }

  /**
   * Démarre une nouvelle saga
   */
  async startSaga(
    type: SagaType,
    data: Record<string, any>
  ): Promise<Saga> {
    try {
      // Créer la saga
      const saga = this.sagaRepository.create({
        type,
        status: SagaStatus.PENDING,
        data
      });

      const savedSaga = await this.sagaRepository.save(saga);

      // Créer les étapes initiales
      await this.createInitialSteps(savedSaga, type);

      logger.info(`Saga démarrée: ${savedSaga.id} (${type})`);
      return savedSaga;
    } catch (error) {
      logger.error(`Erreur lors du démarrage de la saga: ${error}`);
      throw error;
    }
  }

  /**
   * Exécute la saga de manière synchrone
   */
  async executeSaga(sagaId: string): Promise<Saga> {
    const saga = await this.sagaRepository.findOne({
      where: { id: sagaId },
      relations: ['steps']
    });

    if (!saga) {
      throw new Error(`Saga non trouvée: ${sagaId}`);
    }

    const executor = this.executors.get(saga.type);
    if (!executor) {
      throw new Error(`Exécuteur non trouvé pour le type: ${saga.type}`);
    }

    try {
      // Marquer la saga comme en cours
      saga.status = SagaStatus.IN_PROGRESS;
      await this.sagaRepository.save(saga);

      // Exécuter chaque étape
      for (const step of saga.steps.sort((a, b) => a.step_order - b.step_order)) {
        if (step.status === StepStatus.COMPLETED) {
          continue; // Étape déjà terminée
        }

        await this.executeStep(saga, step, executor);
      }

      // Marquer la saga comme terminée
      saga.markAsCompleted();
      await this.sagaRepository.save(saga);

      logger.info(`Saga terminée avec succès: ${sagaId}`);
      return saga;
    } catch (error) {
      // Gérer l'échec et la compensation
      await this.handleSagaFailure(saga, error as Error);
      throw error;
    }
  }

  /**
   * Exécute une étape spécifique
   */
  private async executeStep(
    saga: Saga,
    step: SagaStep,
    executor: SagaExecutor
  ): Promise<void> {
    try {
      // Marquer l'étape comme en cours
      step.markAsInProgress();
      await this.stepRepository.save(step);

      // Préparer le contexte d'exécution
      const context: SagaExecutionContext = {
        saga,
        currentStep: step,
        stepData: step.input_data
      };

      // Exécuter l'étape
      const outputData = await executor.executeStep(context);

      // Marquer l'étape comme terminée
      step.markAsCompleted(outputData);
      await this.stepRepository.save(step);

      logger.info(`Étape exécutée: ${step.type} pour la saga ${saga.id}`);
    } catch (error) {
      // Gérer l'échec de l'étape
      await this.handleStepFailure(step, error as Error);
      throw error;
    }
  }

  /**
   * Gère l'échec d'une étape
   */
  private async handleStepFailure(step: SagaStep, error: Error): Promise<void> {
    step.markAsFailed(error.message);
    await this.stepRepository.save(step);

    logger.error(`Échec de l'étape ${step.type}: ${error.message}`);
  }

  /**
   * Gère l'échec de la saga et lance la compensation
   */
  private async handleSagaFailure(saga: Saga, error: Error): Promise<void> {
    saga.markAsFailed(error.message);
    await this.sagaRepository.save(saga);

    logger.error(`Échec de la saga ${saga.id}: ${error.message}`);

    // Lancer la compensation
    await this.compensateSaga(saga);
  }

  /**
   * Compense une saga en cas d'échec
   */
  async compensateSaga(saga: Saga): Promise<void> {
    const executor = this.executors.get(saga.type);
    if (!executor) {
      throw new Error(`Exécuteur non trouvé pour la compensation: ${saga.type}`);
    }

    // Trouver les étapes complétées dans l'ordre inverse
    const completedSteps = saga.steps
      .filter(step => step.status === StepStatus.COMPLETED)
      .sort((a, b) => b.step_order - a.step_order);

    for (const step of completedSteps) {
      try {
        const compensationStep = executor.getCompensationStep(step);
        if (compensationStep) {
          const context: SagaExecutionContext = {
            saga,
            currentStep: compensationStep,
            stepData: step.output_data || {}
          };

          await executor.compensateStep(context);
          step.markAsCompensated();
          await this.stepRepository.save(step);

          logger.info(`Compensation effectuée pour l'étape: ${step.type}`);
        }
      } catch (compensationError) {
        logger.error(`Erreur lors de la compensation de l'étape ${step.type}: ${compensationError}`);
        // Continuer avec les autres compensations
      }
    }

    saga.status = SagaStatus.COMPENSATED;
    await this.sagaRepository.save(saga);
  }

  /**
   * Crée les étapes initiales pour une saga
   */
  private async createInitialSteps(saga: Saga, type: SagaType): Promise<void> {
    const steps: Partial<SagaStep>[] = [];

    switch (type) {
      case SagaType.PURCHASE_SAGA:
        steps.push(
          { step_order: 1, type: StepType.VALIDATE_INVENTORY, input_data: saga.data },
          { step_order: 2, type: StepType.RESERVE_INVENTORY, input_data: saga.data },
          { step_order: 3, type: StepType.PROCESS_PAYMENT, input_data: saga.data },
          { step_order: 4, type: StepType.CREATE_SALE, input_data: saga.data },
          { step_order: 5, type: StepType.UPDATE_INVENTORY, input_data: saga.data }
        );
        break;

      case SagaType.RETURN_SAGA:
        steps.push(
          { step_order: 1, type: StepType.VALIDATE_RETURN, input_data: saga.data },
          { step_order: 2, type: StepType.PROCESS_REFUND, input_data: saga.data },
          { step_order: 3, type: StepType.RESTORE_INVENTORY, input_data: saga.data },
          { step_order: 4, type: StepType.UPDATE_SALE, input_data: saga.data }
        );
        break;

      default:
        throw new Error(`Type de saga non supporté: ${type}`);
    }

    // Créer les étapes
    for (const stepData of steps) {
      const step = this.stepRepository.create({
        ...stepData,
        saga_id: saga.id
      });
      await this.stepRepository.save(step);
    }
  }

  /**
   * Récupère une saga avec ses étapes
   */
  async getSaga(sagaId: string): Promise<Saga | null> {
    return this.sagaRepository.findOne({
      where: { id: sagaId },
      relations: ['steps']
    });
  }

  /**
   * Récupère toutes les sagas
   */
  async getAllSagas(): Promise<Saga[]> {
    return this.sagaRepository.find({
      relations: ['steps'],
      order: { created_at: 'DESC' }
    });
  }
} 