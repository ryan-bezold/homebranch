import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedAdminRole1739836800001 implements MigrationInterface {
  name = 'SeedAdminRole1739836800001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "role_entity" ("id", "name", "permissions") VALUES (uuid_generate_v4(), 'admin', 'manage_users,manage_roles,manage_books,manage_bookshelves')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "role_entity" WHERE "name" = 'admin'`);
  }
}
