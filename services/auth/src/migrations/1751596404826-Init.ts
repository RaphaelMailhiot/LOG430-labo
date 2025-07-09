import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1751596404826 implements MigrationInterface {
    name = 'Init1751596404826';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE TABLE "manager" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "store_id" integer NOT NULL, CONSTRAINT "PK_b3ac840005ee4ed76a7f1c51d01" PRIMARY KEY ("id"))');
        await queryRunner.query('CREATE TABLE "customer" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "cart_id" integer NOT NULL, CONSTRAINT "PK_a7a13f4cacb744524e44dfdad32" PRIMARY KEY ("id"))');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE "customer"');
        await queryRunner.query('DROP TABLE "manager"');
    }

}
