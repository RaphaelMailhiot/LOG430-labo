import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1751597833141 implements MigrationInterface {
    name = 'Init1751597833141';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE TABLE "inventory_product" ("id" SERIAL NOT NULL, "store_id" integer NOT NULL, "product_id" integer NOT NULL, "stock" integer NOT NULL, CONSTRAINT "PK_732fdb1f76432d65d2c136340dc" PRIMARY KEY ("id"))');
        await queryRunner.query('CREATE TABLE "supply_request" ("id" SERIAL NOT NULL, "store_id" integer NOT NULL, "quantity" integer NOT NULL, "product_id" integer NOT NULL, CONSTRAINT "PK_75558ced18913da34ae201bc75b" PRIMARY KEY ("id"))');
        await queryRunner.query('ALTER TABLE "supply_request" ADD CONSTRAINT "FK_a1f64aee549132e78f24d4c7370" FOREIGN KEY ("product_id") REFERENCES "inventory_product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "supply_request" DROP CONSTRAINT "FK_a1f64aee549132e78f24d4c7370"');
        await queryRunner.query('DROP TABLE "supply_request"');
        await queryRunner.query('DROP TABLE "inventory_product"');
    }

}
