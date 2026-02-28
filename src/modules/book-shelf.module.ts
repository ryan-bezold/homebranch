import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth.module';
import { BookShelfEntity } from 'src/infrastructure/database/book-shelf.entity';
import { BookEntity } from 'src/infrastructure/database/book.entity';
import { TypeOrmBookShelfRepository } from '../infrastructure/repositories/book-shelf.repository';
import { CreateBookShelfUseCase } from '../application/usecases/bookshelf/create-book-shelf-use-case.service';
import { GetBookShelvesUseCase } from '../application/usecases/bookshelf/get-book-shelves-use-case.service';
import { GetBookShelfByIdUseCase } from '../application/usecases/bookshelf/get-book-shelf-by-id-use-case.service';
import { UpdateBookShelfUseCase } from '../application/usecases/bookshelf/update-book-shelf-use-case.service';
import { AddBookToBookShelfUseCase } from '../application/usecases/bookshelf/add-book-to-book-shelf-use-case.service';
import { RemoveBookFromBookShelfUseCase } from '../application/usecases/bookshelf/remove-book-from-book-shelf-use-case.service';
import { BookShelfMapper } from '../infrastructure/mappers/book-shelf.mapper';
import { BookShelfController } from '../presentation/controllers/book-shelf.controller';
import { BooksModule } from './book.module';
import { DeleteBookShelfUseCase } from '../application/usecases/bookshelf/delete-book-shelf-use-case.service';
import { GetBookShelfBooksUseCase } from '../application/usecases/bookshelf/get-book-shelf-books-use-case.service';
import { GetBookShelvesByBookUseCase } from '../application/usecases/bookshelf/get-book-shelves-by-book-use-case.service';

@Module({
  imports: [TypeOrmModule.forFeature([BookShelfEntity, BookEntity]), AuthModule, BooksModule],
  providers: [
    // Repository
    {
      provide: 'BookShelfRepository',
      useClass: TypeOrmBookShelfRepository,
    },

    // Use Cases (add all that your controller uses)
    CreateBookShelfUseCase,
    DeleteBookShelfUseCase,
    GetBookShelvesUseCase,
    GetBookShelfByIdUseCase,
    GetBookShelfBooksUseCase,
    GetBookShelvesByBookUseCase,
    UpdateBookShelfUseCase,
    AddBookToBookShelfUseCase,
    RemoveBookFromBookShelfUseCase,
    // ... other use cases

    // Mappers
    BookShelfMapper,
  ],
  controllers: [BookShelfController],
  exports: [],
})
export class BookShelvesModule {}
