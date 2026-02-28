import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUploadedByUserIdToBook1767225600000 implements MigrationInterface {
  name = 'AddUploadedByUserIdToBook1767225600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_entity" ADD COLUMN "uploaded_by_user_id" varchar DEFAULT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_entity" DROP COLUMN "uploaded_by_user_id"`);
  }
}
