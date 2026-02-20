import { MigrationInterface, QueryRunner } from 'typeorm';

export class SchemaUpdate1755566512418 implements MigrationInterface {
  name = 'SchemaUpdate1755566512418';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "book_shelf_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, CONSTRAINT "PK_067f8f6174b88cea88ab359d9ff" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "book_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "author" character varying NOT NULL, "is_favorite" boolean NOT NULL, "published_year" integer, "file_name" character varying NOT NULL, "cover_image_file_name" character varying, CONSTRAINT "PK_3ea5638ccafa8799838e68fad46" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "book_shelf_books" ("book_shelf_id" uuid NOT NULL, "book_id" uuid NOT NULL, CONSTRAINT "PK_book_shelf_books" PRIMARY KEY ("book_shelf_id", "book_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_shelf_books" ADD CONSTRAINT "FK_book_shelf_books_shelf" FOREIGN KEY ("book_shelf_id") REFERENCES "book_shelf_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_shelf_books" ADD CONSTRAINT "FK_book_shelf_books_book" FOREIGN KEY ("book_id") REFERENCES "book_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "book_shelf_books" DROP CONSTRAINT "FK_book_shelf_books_book"`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_shelf_books" DROP CONSTRAINT "FK_book_shelf_books_shelf"`,
    );
    await queryRunner.query(`DROP TABLE "book_shelf_books"`);
    await queryRunner.query(`DROP TABLE "book_entity"`);
    await queryRunner.query(`DROP TABLE "book_shelf_entity"`);
  }
}
