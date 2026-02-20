import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserAndRoleTables1739836800000 implements MigrationInterface {
  name = 'AddUserAndRoleTables1739836800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "role_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "permissions" text NOT NULL DEFAULT '', CONSTRAINT "UQ_role_entity_name" UNIQUE ("name"), CONSTRAINT "PK_role_entity" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_entity" ("id" uuid NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "is_restricted" boolean NOT NULL DEFAULT false, "role_id" uuid, CONSTRAINT "PK_user_entity" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_entity" ADD CONSTRAINT "FK_user_entity_role" FOREIGN KEY ("role_id") REFERENCES "role_entity"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_entity" DROP CONSTRAINT "FK_user_entity_role"`,
    );
    await queryRunner.query(`DROP TABLE "user_entity"`);
    await queryRunner.query(`DROP TABLE "role_entity"`);
  }
}
