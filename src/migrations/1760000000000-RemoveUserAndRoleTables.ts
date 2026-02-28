import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUserAndRoleTables1760000000000 implements MigrationInterface {
  name = 'RemoveUserAndRoleTables1760000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop FK from saved_position_entity to user_entity
    await queryRunner.query(
      `ALTER TABLE "saved_position_entity" DROP CONSTRAINT IF EXISTS "FK_saved_position_user"`,
    );

    // Drop user_entity and role_entity tables
    await queryRunner.query(`DROP TABLE IF EXISTS "user_entity"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "role_entity"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "role_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "permissions" text NOT NULL DEFAULT '', CONSTRAINT "UQ_role_entity_name" UNIQUE ("name"), CONSTRAINT "PK_role_entity" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_entity" ("id" uuid NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "is_restricted" boolean NOT NULL DEFAULT false, "role_id" uuid, CONSTRAINT "PK_user_entity" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_entity" ADD CONSTRAINT "FK_user_entity_role" FOREIGN KEY ("role_id") REFERENCES "role_entity"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_position_entity" ADD CONSTRAINT "FK_saved_position_user" FOREIGN KEY ("user_id") REFERENCES "user_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
