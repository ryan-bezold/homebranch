import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSummaryToBook1755566512421 implements MigrationInterface {
  name = 'AddSummaryToBook1755566512421';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_entity" ADD COLUMN "summary" text DEFAULT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_entity" DROP COLUMN "summary"`);
  }
}
