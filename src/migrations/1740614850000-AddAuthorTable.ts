import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuthorTable1740614850000 implements MigrationInterface {
  name = 'AddAuthorTable1740614850000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "author_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "biography" text, "profile_picture_url" character varying, CONSTRAINT "PK_author_entity" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_author_entity_name_lower" ON "author_entity" (LOWER("name"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "UQ_author_entity_name_lower"`);
    await queryRunner.query(`DROP TABLE "author_entity"`);
  }
}
