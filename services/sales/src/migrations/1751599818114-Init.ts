import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1751599818114 implements MigrationInterface {
    name = 'Init1751599818114';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE TABLE "shopping_cart" ("id" SERIAL NOT NULL, "customer_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_40f9358cdf55d73d8a2ad226592" PRIMARY KEY ("id"))');
        await queryRunner.query('CREATE TABLE "shopping_cart_product" ("id" SERIAL NOT NULL, "product_id" integer NOT NULL, "quantity" integer NOT NULL, "cartId" integer, CONSTRAINT "PK_e9714a8554c8b915d109d3de5c9" PRIMARY KEY ("id"))');
        await queryRunner.query('CREATE TABLE "sale_item" ("sale_id" integer NOT NULL, "product_id" integer NOT NULL, "quantity" integer NOT NULL, "price" real NOT NULL, CONSTRAINT "PK_90bf979b24ccd41b40b51179bfb" PRIMARY KEY ("sale_id", "product_id"))');
        await queryRunner.query('CREATE TABLE "sale" ("id" SERIAL NOT NULL, "store_id" integer NOT NULL, "date" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d03891c457cbcd22974732b5de2" PRIMARY KEY ("id"))');
        await queryRunner.query('CREATE TABLE "checkout" ("id" SERIAL NOT NULL, "customer_id" integer NOT NULL, "store_id" integer NOT NULL, "total_amount" integer NOT NULL DEFAULT \'0\', "payment_method" character varying NOT NULL, CONSTRAINT "PK_c3c52ebf395ba358759b1111ac1" PRIMARY KEY ("id"))');
        await queryRunner.query('ALTER TABLE "shopping_cart_product" ADD CONSTRAINT "FK_22fddc213306ca54d08e2c05340" FOREIGN KEY ("cartId") REFERENCES "shopping_cart"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
        await queryRunner.query('ALTER TABLE "sale_item" ADD CONSTRAINT "FK_86634f729a5a169e50ab18b98a6" FOREIGN KEY ("sale_id") REFERENCES "sale"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "sale_item" DROP CONSTRAINT "FK_86634f729a5a169e50ab18b98a6"');
        await queryRunner.query('ALTER TABLE "shopping_cart_product" DROP CONSTRAINT "FK_22fddc213306ca54d08e2c05340"');
        await queryRunner.query('DROP TABLE "checkout"');
        await queryRunner.query('DROP TABLE "sale"');
        await queryRunner.query('DROP TABLE "sale_item"');
        await queryRunner.query('DROP TABLE "shopping_cart_product"');
        await queryRunner.query('DROP TABLE "shopping_cart"');
    }

}
