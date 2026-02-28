import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreatedByUserIdToBookShelf1772317868306 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "book_shelf_entity" ADD COLUMN IF NOT EXISTS "created_by_user_id" character varying`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "book_shelf_entity" DROP COLUMN IF EXISTS "created_by_user_id"`,
        );
    }

}
