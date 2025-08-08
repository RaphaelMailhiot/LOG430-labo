import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { SagaStep } from './SagaStep';

export enum SagaStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  COMPENSATED = 'compensated'
}

export enum SagaType {
  PURCHASE_SAGA = 'purchase_saga',
  RETURN_SAGA = 'return_saga',
  INVENTORY_UPDATE_SAGA = 'inventory_update_saga',
  PAYMENT_SAGA = 'payment_saga'
}

@Entity()
export class Saga {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: SagaType,
    nullable: false
  })
  type!: SagaType;

  @Column({
    type: 'enum',
    enum: SagaStatus,
    default: SagaStatus.PENDING
  })
  status!: SagaStatus;

  @Column('jsonb', { nullable: true })
  data!: Record<string, any>;

  @Column('text', { nullable: true })
  error_message?: string;

  @Column('int', { default: 0 })
  retry_count!: number;

  @Column('int', { default: 3 })
  max_retries!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column('timestamp', { nullable: true })
  completed_at?: Date;

  @OneToMany(() => SagaStep, step => step.saga, { cascade: true })
  steps!: SagaStep[];

  // Méthodes utilitaires
  isCompleted(): boolean {
    return this.status === SagaStatus.COMPLETED;
  }

  isFailed(): boolean {
    return this.status === SagaStatus.FAILED;
  }

  canRetry(): boolean {
    return this.retry_count < this.max_retries;
  }

  incrementRetryCount(): void {
    this.retry_count++;
  }

  markAsCompleted(): void {
    this.status = SagaStatus.COMPLETED;
    this.completed_at = new Date();
  }

  markAsFailed(errorMessage: string): void {
    this.status = SagaStatus.FAILED;
    this.error_message = errorMessage;
  }
} 