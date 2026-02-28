import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorEntity } from 'src/infrastructure/database/author.entity';
import { BookEntity } from 'src/infrastructure/database/book.entity';
import { TypeOrmAuthorRepository } from 'src/infrastructure/repositories/author.repository';
import { AuthorMapper } from 'src/infrastructure/mappers/author.mapper';
import { OpenLibraryGateway } from 'src/infrastructure/gateways/open-library.gateway';
import { GetAuthorsUseCase } from 'src/application/usecases/author/get-authors.usecase';
import { GetAuthorUseCase } from 'src/application/usecases/author/get-author.usecase';
import { GetBooksByAuthorUseCase } from 'src/application/usecases/author/get-books-by-author.usecase';
import { UpdateAuthorUseCase } from 'src/application/usecases/author/update-author.usecase';
import { UploadAuthorProfilePictureUseCase } from 'src/application/usecases/author/upload-author-profile-picture.usecase';
import { AuthorController } from 'src/presentation/controllers/author.controller';
import { AuthModule } from 'src/modules/auth.module';
import { BooksModule } from 'src/modules/book.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthorEntity, BookEntity]),
    AuthModule,
    forwardRef(() => BooksModule),
  ],
  providers: [
    {
      provide: 'AuthorRepository',
      useClass: TypeOrmAuthorRepository,
    },
    GetAuthorsUseCase,
    GetAuthorUseCase,
    GetBooksByAuthorUseCase,
    UpdateAuthorUseCase,
    UploadAuthorProfilePictureUseCase,
    OpenLibraryGateway,
    AuthorMapper,
  ],
  controllers: [AuthorController],
  exports: ['AuthorRepository'],
})
export class AuthorsModule {}
