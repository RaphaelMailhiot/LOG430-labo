import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1751599081739 implements MigrationInterface {
    name = 'Init1751599081739'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "store" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "isMain" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_f3172007d4de5ae8e7692759d79" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "store"`);
    }

}
