import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPercentageToSavedPosition1755566512420 implements MigrationInterface {
  name = 'AddPercentageToSavedPosition1755566512420';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "saved_position_entity" ADD COLUMN "percentage" double precision DEFAULT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "saved_position_entity" DROP COLUMN "percentage"`);
  }
}
