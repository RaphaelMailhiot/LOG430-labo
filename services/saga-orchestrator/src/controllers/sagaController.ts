import { Request, Response } from 'express';
import { SagaOrchestratorService } from '../services/SagaOrchestratorService';
import { SagaType, SagaStatus } from '../entities/Saga';
import { StepStatus } from '../entities/SagaStep';
import { logger } from '../middleware/logger';

export class SagaController {
  constructor(private sagaOrchestrator: SagaOrchestratorService) {}

  /**
   * Démarre une nouvelle saga
   */
  async startSaga(req: Request, res: Response): Promise<void> {
    try {
      const { type, data } = req.body;

      if (!type || !data) {
        res.status(400).json({
          error: 'Type et données de saga requis'
        });
        return;
      }

      if (!Object.values(SagaType).includes(type)) {
        res.status(400).json({
          error: `Type de saga invalide. Types supportés: ${Object.values(SagaType).join(', ')}`
        });
        return;
      }

      const saga = await this.sagaOrchestrator.startSaga(type, data);

      res.status(201).json({
        message: 'Saga démarrée avec succès',
        saga: {
          id: saga.id,
          type: saga.type,
          status: saga.status,
          created_at: saga.created_at
        }
      });
    } catch (error) {
      logger.error(`Erreur lors du démarrage de la saga: ${error}`);
      res.status(500).json({
        error: 'Erreur lors du démarrage de la saga',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  /**
   * Exécute une saga de manière synchrone
   */
  async executeSaga(req: Request, res: Response): Promise<void> {
    try {
      const { sagaId } = req.params;

      if (!sagaId) {
        res.status(400).json({
          error: 'ID de saga requis'
        });
        return;
      }

      const saga = await this.sagaOrchestrator.executeSaga(sagaId);

      res.status(200).json({
        message: 'Saga exécutée avec succès',
        saga: {
          id: saga.id,
          type: saga.type,
          status: saga.status,
          completed_at: saga.completed_at,
          steps: saga.steps.map(step => ({
            id: step.id,
            type: step.type,
            status: step.status,
            step_order: step.step_order,
            started_at: step.started_at,
            completed_at: step.completed_at
          }))
        }
      });
    } catch (error) {
      logger.error(`Erreur lors de l'exécution de la saga: ${error}`);
      res.status(500).json({
        error: 'Erreur lors de l\'exécution de la saga',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  /**
   * Récupère une saga par son ID
   */
  async getSaga(req: Request, res: Response): Promise<void> {
    try {
      const { sagaId } = req.params;

      if (!sagaId) {
        res.status(400).json({
          error: 'ID de saga requis'
        });
        return;
      }

      const saga = await this.sagaOrchestrator.getSaga(sagaId);

      if (!saga) {
        res.status(404).json({
          error: 'Saga non trouvée'
        });
        return;
      }

      res.status(200).json({
        saga: {
          id: saga.id,
          type: saga.type,
          status: saga.status,
          data: saga.data,
          error_message: saga.error_message,
          retry_count: saga.retry_count,
          max_retries: saga.max_retries,
          created_at: saga.created_at,
          updated_at: saga.updated_at,
          completed_at: saga.completed_at,
          steps: saga.steps.map(step => ({
            id: step.id,
            type: step.type,
            status: step.status,
            step_order: step.step_order,
            input_data: step.input_data,
            output_data: step.output_data,
            error_message: step.error_message,
            retry_count: step.retry_count,
            started_at: step.started_at,
            completed_at: step.completed_at,
            compensated_at: step.compensated_at
          }))
        }
      });
    } catch (error) {
      logger.error(`Erreur lors de la récupération de la saga: ${error}`);
      res.status(500).json({
        error: 'Erreur lors de la récupération de la saga',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  /**
   * Récupère toutes les sagas
   */
  async getAllSagas(req: Request, res: Response): Promise<void> {
    try {
      const { status, type, limit = 50, offset = 0 } = req.query;

      const sagas = await this.sagaOrchestrator.getAllSagas();

      // Filtrage optionnel
      let filteredSagas = sagas;

      if (status) {
        filteredSagas = filteredSagas.filter(saga => saga.status === status);
      }

      if (type) {
        filteredSagas = filteredSagas.filter(saga => saga.type === type);
      }

      // Pagination
      const paginatedSagas = filteredSagas.slice(
        Number(offset),
        Number(offset) + Number(limit)
      );

      res.status(200).json({
        sagas: paginatedSagas.map(saga => ({
          id: saga.id,
          type: saga.type,
          status: saga.status,
          retry_count: saga.retry_count,
          created_at: saga.created_at,
          updated_at: saga.updated_at,
          completed_at: saga.completed_at,
          steps_count: saga.steps.length,
          completed_steps: saga.steps.filter(step => step.status === 'completed').length
        })),
        pagination: {
          total: filteredSagas.length,
          limit: Number(limit),
          offset: Number(offset),
          has_more: Number(offset) + Number(limit) < filteredSagas.length
        }
      });
    } catch (error) {
      logger.error(`Erreur lors de la récupération des sagas: ${error}`);
      res.status(500).json({
        error: 'Erreur lors de la récupération des sagas',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  /**
   * Compense une saga en cas d'échec
   */
  async compensateSaga(req: Request, res: Response): Promise<void> {
    try {
      const { sagaId } = req.params;

      if (!sagaId) {
        res.status(400).json({
          error: 'ID de saga requis'
        });
        return;
      }

      const saga = await this.sagaOrchestrator.getSaga(sagaId);

      if (!saga) {
        res.status(404).json({
          error: 'Saga non trouvée'
        });
        return;
      }

      await this.sagaOrchestrator.compensateSaga(saga);

      res.status(200).json({
        message: 'Compensation de saga effectuée',
        saga: {
          id: saga.id,
          type: saga.type,
          status: saga.status,
          updated_at: saga.updated_at
        }
      });
    } catch (error) {
      logger.error(`Erreur lors de la compensation de la saga: ${error}`);
      res.status(500).json({
        error: 'Erreur lors de la compensation de la saga',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  /**
   * Retente l'exécution d'une saga échouée
   */
  async retrySaga(req: Request, res: Response): Promise<void> {
    try {
      const { sagaId } = req.params;

      if (!sagaId) {
        res.status(400).json({
          error: 'ID de saga requis'
        });
        return;
      }

      const saga = await this.sagaOrchestrator.getSaga(sagaId);

      if (!saga) {
        res.status(404).json({
          error: 'Saga non trouvée'
        });
        return;
      }

      if (saga.status !== SagaStatus.FAILED) {
        res.status(400).json({
          error: 'Seules les sagas échouées peuvent être retentées'
        });
        return;
      }

      if (!saga.canRetry()) {
        res.status(400).json({
          error: 'Nombre maximum de tentatives atteint'
        });
        return;
      }

      // Réinitialiser la saga pour une nouvelle tentative
      saga.status = SagaStatus.PENDING;
      saga.error_message = undefined;
      saga.incrementRetryCount();

      // Réinitialiser les étapes échouées
      for (const step of saga.steps) {
        if (step.status === StepStatus.FAILED) {
          step.status = StepStatus.PENDING;
          step.error_message = undefined;
        }
      }

      // Exécuter la saga
      const executedSaga = await this.sagaOrchestrator.executeSaga(sagaId);

      res.status(200).json({
        message: 'Saga retentée avec succès',
        saga: {
          id: executedSaga.id,
          type: executedSaga.type,
          status: executedSaga.status,
          retry_count: executedSaga.retry_count,
          completed_at: executedSaga.completed_at
        }
      });
    } catch (error) {
      logger.error(`Erreur lors de la nouvelle tentative de la saga: ${error}`);
      res.status(500).json({
        error: 'Erreur lors de la nouvelle tentative de la saga',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }
} 