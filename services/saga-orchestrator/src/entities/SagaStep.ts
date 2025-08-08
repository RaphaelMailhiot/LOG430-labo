import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Saga } from './Saga';

export enum StepStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  COMPENSATED = 'compensated'
}

export enum StepType {
  // Étapes pour la saga d'achat
  VALIDATE_INVENTORY = 'validate_inventory',
  RESERVE_INVENTORY = 'reserve_inventory',
  PROCESS_PAYMENT = 'process_payment',
  CREATE_SALE = 'create_sale',
  UPDATE_INVENTORY = 'update_inventory',
  
  // Étapes de compensation
  RELEASE_INVENTORY = 'release_inventory',
  REFUND_PAYMENT = 'refund_payment',
  CANCEL_SALE = 'cancel_sale',
  
  // Étapes pour la saga de retour
  VALIDATE_RETURN = 'validate_return',
  PROCESS_REFUND = 'process_refund',
  RESTORE_INVENTORY = 'restore_inventory',
  UPDATE_SALE = 'update_sale',
  
  // Étapes de compensation pour les retours
  REVERSE_REFUND = 'reverse_refund',
  REVERSE_INVENTORY_RESTORE = 'reverse_inventory_restore',
  REVERSE_SALE_UPDATE = 'reverse_sale_update'
}

@Entity()
export class SagaStep {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  saga_id!: string;

  @Column()
  step_order!: number;

  @Column({
    type: 'enum',
    enum: StepType,
    nullable: false
  })
  type!: StepType;

  @Column({
    type: 'enum',
    enum: StepStatus,
    default: StepStatus.PENDING
  })
  status!: StepStatus;

  @Column('jsonb', { nullable: true })
  input_data!: Record<string, any>;

  @Column('jsonb', { nullable: true })
  output_data?: Record<string, any>;

  @Column('text', { nullable: true })
  error_message?: string;

  @Column('int', { default: 0 })
  retry_count!: number;

  @Column('int', { default: 3 })
  max_retries!: number;

  @Column('timestamp', { nullable: true })
  started_at?: Date;

  @Column('timestamp', { nullable: true })
  completed_at?: Date;

  @Column('timestamp', { nullable: true })
  compensated_at?: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => Saga, saga => saga.steps)
  saga!: Saga;

  // Méthodes utilitaires
  isCompleted(): boolean {
    return this.status === StepStatus.COMPLETED;
  }

  isFailed(): boolean {
    return this.status === StepStatus.FAILED;
  }

  isCompensated(): boolean {
    return this.status === StepStatus.COMPENSATED;
  }

  canRetry(): boolean {
    return this.retry_count < this.max_retries;
  }

  incrementRetryCount(): void {
    this.retry_count++;
  }

  markAsInProgress(): void {
    this.status = StepStatus.IN_PROGRESS;
    this.started_at = new Date();
  }

  markAsCompleted(outputData?: Record<string, any>): void {
    this.status = StepStatus.COMPLETED;
    this.completed_at = new Date();
    if (outputData) {
      this.output_data = outputData;
    }
  }

  markAsFailed(errorMessage: string): void {
    this.status = StepStatus.FAILED;
    this.error_message = errorMessage;
  }

  markAsCompensated(): void {
    this.status = StepStatus.COMPENSATED;
    this.compensated_at = new Date();
  }

  getDuration(): number | null {
    if (this.started_at && this.completed_at) {
      return this.completed_at.getTime() - this.started_at.getTime();
    }
    return null;
  }
} 