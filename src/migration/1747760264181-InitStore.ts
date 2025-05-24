import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitStore1747760264181 implements MigrationInterface {
    name = 'InitStore1747760264181';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "product" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "name" text NOT NULL,
                "category" text,
                "price" decimal(10,2) NOT NULL,
                "stock" integer NOT NULL
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "sale" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "createdAt" datetime NOT NULL DEFAULT (datetime('now'))
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "sale_product" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "quantity" integer NOT NULL,
                "unitPrice" decimal(10,2) NOT NULL,
                "sale_id" integer,
                "product_id" integer,
                CONSTRAINT "FK_sale" FOREIGN KEY ("sale_id") REFERENCES "sale" ("id") ON DELETE CASCADE,
                CONSTRAINT "FK_product" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE NO ACTION
            )
        `);

        // Ajout de 5 produits avec un stock initial
        await queryRunner.query(`
            INSERT INTO "product" ("name", "category", "price", "stock") VALUES
            ('Clavier', 'Informatique', 49.99, 20),
            ('Souris', 'Informatique', 19.99, 35),
            ('Écran', 'Informatique', 199.99, 10),
            ('Câble HDMI', 'Accessoires', 9.99, 50),
            ('Casque audio', 'Audio', 59.99, 15)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "sale_product"');
        await queryRunner.query('DROP TABLE IF EXISTS "sale"');
        await queryRunner.query('DROP TABLE IF EXISTS "product"');
    }
}