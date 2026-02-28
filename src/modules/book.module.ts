import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateBookUseCase } from 'src/application/usecases/book/create-book.usecase';
import { DeleteBookUseCase } from 'src/application/usecases/book/delete-book.usecase';
import { DownloadBookUseCase } from 'src/application/usecases/book/download-book.usecase';
import { GetBookByIdUseCase } from 'src/application/usecases/book/get-book-by-id.usecase';
import { GetBooksUseCase } from 'src/application/usecases/book/get-books.usecase';
import { GetFavoriteBooksUseCase } from 'src/application/usecases/book/get-favorite-books-use-case.service';
import { UpdateBookUseCase } from 'src/application/usecases/book/update-book.usecase';
import { BookEntity } from 'src/infrastructure/database/book.entity';
import { BookMapper } from 'src/infrastructure/mappers/book.mapper';
import { TypeOrmBookRepository } from 'src/infrastructure/repositories/book.repository';
import { BookController } from 'src/presentation/controllers/book.controller';
import { AuthModule } from 'src/modules/auth.module';
import { OpenLibraryGateway } from 'src/infrastructure/gateways/open-library.gateway';
import { FetchBookSummaryUseCase } from 'src/application/usecases/book/fetch-book-summary.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([BookEntity]), AuthModule],
  providers: [
    // Repository
    {
      provide: 'BookRepository',
      useClass: TypeOrmBookRepository,
    },

    // Use Cases (add all that your controller uses)
    CreateBookUseCase,
    DeleteBookUseCase,
    DownloadBookUseCase,
    GetBooksUseCase,
    GetFavoriteBooksUseCase,
    GetBookByIdUseCase,
    UpdateBookUseCase,
    FetchBookSummaryUseCase,
    // ... other use cases

    // Mappers
    BookMapper,

    // Gateways
    OpenLibraryGateway,
  ],
  controllers: [BookController],
  exports: ['BookRepository'],
})
export class BooksModule {}
