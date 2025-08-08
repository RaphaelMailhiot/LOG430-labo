import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1751596404826 implements MigrationInterface {
    name = 'Init1751596404826';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Création de la table saga
        await queryRunner.query(`
            CREATE TYPE "public"."saga_type_enum" AS ENUM('purchase_saga', 'return_saga', 'inventory_update_saga', 'payment_saga')
        `);
        
        await queryRunner.query(`
            CREATE TYPE "public"."saga_status_enum" AS ENUM('pending', 'in_progress', 'completed', 'failed', 'compensated')
        `);
        
        await queryRunner.query(`
            CREATE TABLE "saga" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "type" "public"."saga_type_enum" NOT NULL,
                "status" "public"."saga_status_enum" NOT NULL DEFAULT 'pending',
                "data" jsonb,
                "error_message" text,
                "retry_count" integer NOT NULL DEFAULT '0',
                "max_retries" integer NOT NULL DEFAULT '3',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "completed_at" TIMESTAMP,
                CONSTRAINT "PK_saga_id" PRIMARY KEY ("id")
            )
        `);

        // Création de la table saga_step
        await queryRunner.query(`
            CREATE TYPE "public"."step_type_enum" AS ENUM(
                'validate_inventory', 'reserve_inventory', 'process_payment', 'create_sale', 'update_inventory',
                'release_inventory', 'refund_payment', 'cancel_sale',
                'validate_return', 'process_refund', 'restore_inventory', 'update_sale',
                'reverse_refund', 'reverse_inventory_restore', 'reverse_sale_update'
            )
        `);
        
        await queryRunner.query(`
            CREATE TYPE "public"."step_status_enum" AS ENUM('pending', 'in_progress', 'completed', 'failed', 'compensated')
        `);
        
        await queryRunner.query(`
            CREATE TABLE "saga_step" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "saga_id" uuid NOT NULL,
                "step_order" integer NOT NULL,
                "type" "public"."step_type_enum" NOT NULL,
                "status" "public"."step_status_enum" NOT NULL DEFAULT 'pending',
                "input_data" jsonb,
                "output_data" jsonb,
                "error_message" text,
                "retry_count" integer NOT NULL DEFAULT '0',
                "max_retries" integer NOT NULL DEFAULT '3',
                "started_at" TIMESTAMP,
                "completed_at" TIMESTAMP,
                "compensated_at" TIMESTAMP,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_saga_step_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_saga_step_saga_id" FOREIGN KEY ("saga_id") REFERENCES "saga"("id") ON DELETE CASCADE
            )
        `);

        // Création des index pour améliorer les performances
        await queryRunner.query(`
            CREATE INDEX "IDX_saga_type" ON "saga" ("type")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_saga_status" ON "saga" ("status")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_saga_created_at" ON "saga" ("created_at")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_saga_step_saga_id" ON "saga_step" ("saga_id")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_saga_step_type" ON "saga_step" ("type")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_saga_step_status" ON "saga_step" ("status")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_saga_step_order" ON "saga_step" ("saga_id", "step_order")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Suppression des index
        await queryRunner.query('DROP INDEX "IDX_saga_step_order"');
        await queryRunner.query('DROP INDEX "IDX_saga_step_status"');
        await queryRunner.query('DROP INDEX "IDX_saga_step_type"');
        await queryRunner.query('DROP INDEX "IDX_saga_step_saga_id"');
        await queryRunner.query('DROP INDEX "IDX_saga_created_at"');
        await queryRunner.query('DROP INDEX "IDX_saga_status"');
        await queryRunner.query('DROP INDEX "IDX_saga_type"');
        
        // Suppression des tables
        await queryRunner.query('DROP TABLE "saga_step"');
        await queryRunner.query('DROP TABLE "saga"');
        
        // Suppression des types enum
        await queryRunner.query('DROP TYPE "public"."step_status_enum"');
        await queryRunner.query('DROP TYPE "public"."step_type_enum"');
        await queryRunner.query('DROP TYPE "public"."saga_status_enum"');
        await queryRunner.query('DROP TYPE "public"."saga_type_enum"');
    }
} 