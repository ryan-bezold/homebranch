import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BookShelfEntity } from 'src/infrastructure/database/book-shelf.entity';

@Entity()
export class BookEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column({ name: 'is_favorite' })
  isFavorite: boolean;

  @Column({ name: 'published_year', nullable: true })
  publishedYear?: number;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'cover_image_file_name', nullable: true })
  coverImageFileName?: string;

  @ManyToMany(() => BookShelfEntity, (bookShelf) => bookShelf.books)
  bookShelves?: BookShelfEntity[];
}
