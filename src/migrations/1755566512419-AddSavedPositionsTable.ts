import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSavedPositionsTable1755566512419 implements MigrationInterface {
  name = 'AddSavedPositionsTable1755566512419';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "saved_position_entity" (
        "book_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "position" character varying NOT NULL,
        "device_name" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_saved_position_entity" PRIMARY KEY ("book_id", "user_id")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_position_entity" ADD CONSTRAINT "FK_saved_position_book" FOREIGN KEY ("book_id") REFERENCES "book_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_position_entity" ADD CONSTRAINT "FK_saved_position_user" FOREIGN KEY ("user_id") REFERENCES "user_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "saved_position_entity" DROP CONSTRAINT "FK_saved_position_user"`);
    await queryRunner.query(`ALTER TABLE "saved_position_entity" DROP CONSTRAINT "FK_saved_position_book"`);
    await queryRunner.query(`DROP TABLE "saved_position_entity"`);
  }
}
