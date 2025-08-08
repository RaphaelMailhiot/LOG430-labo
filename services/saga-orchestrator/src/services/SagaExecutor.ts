import { Saga } from '../entities/Saga';
import { SagaStep } from '../entities/SagaStep';

export interface SagaExecutionContext {
    saga: Saga;
    currentStep: SagaStep;
    stepData: Record<string, any>;
}

export abstract class SagaExecutor {
    abstract executeStep(context: SagaExecutionContext): Promise<Record<string, any>>;
    abstract compensateStep(context: SagaExecutionContext): Promise<void>;
    abstract getNextStep(currentStep: SagaStep): SagaStep | null;
    abstract getCompensationStep(failedStep: SagaStep): SagaStep | null;
}