import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateBookRequest } from 'src/application/contracts/create-book-request';
import { UpdateBookRequest } from 'src/application/contracts/update-book-request';
import { CreateBookUseCase } from 'src/application/usecases/create-book.usecase';
import { DeleteBookUseCase } from 'src/application/usecases/delete-book.usecase';
import { GetBooksUseCase } from 'src/application/usecases/get-books.usecase';
import { UpdateBookUseCase } from 'src/application/usecases/update-book.usecase';
import { UpdateBookDto } from 'src/presentation/dtos/update-book.dto';
import { GetBookByIdUseCase } from 'src/application/usecases/get-book-by-id.usecase';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { join } from 'path';
import { DeleteBookRequest } from 'src/application/contracts/delete-book-request';
import { GetFavoriteBooksUseCase } from 'src/application/usecases/get-favorite-books-use-case.service';
import { JwtAuthGuard } from 'src/infrastructure/guards/jwt-auth.guard';
import { MapResultInterceptor } from 'src/presentation/interceptors/map_result.interceptor';
import { PaginatedQuery } from 'src/core/paginated-query';

@Controller('books')
@UseInterceptors(MapResultInterceptor)
export class BookController {
  constructor(
    private readonly getBooksUseCase: GetBooksUseCase,
    private readonly getBookByIdUseCase: GetBookByIdUseCase,
    private readonly getFavoriteBooksUseCase: GetFavoriteBooksUseCase,
    private readonly createBookUseCase: CreateBookUseCase,
    private readonly deleteBookUseCase: DeleteBookUseCase,
    private readonly updateBookUseCase: UpdateBookUseCase,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getBooks(@Query() paginationDto: PaginatedQuery) {
    return this.getBooksUseCase.execute(paginationDto);
  }

  @Get('favorite')
  @UseGuards(JwtAuthGuard)
  getFavoriteBooks(@Query() paginationDto: PaginatedQuery) {
    return this.getFavoriteBooksUseCase.execute(paginationDto);
  }

  @Get(`:id`)
  @UseGuards(JwtAuthGuard)
  getBookById(@Param('id') id: string) {
    return this.getBookByIdUseCase.execute({ id });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (
            _req: Express.Request,
            file: Express.Multer.File,
            cb: (error: Error | null, destination: string) => void,
          ) => {
            switch (file.fieldname) {
              case 'file':
                cb(
                  null,
                  `${process.env.UPLOADS_DIRECTORY || join(process.cwd(), 'uploads')}/books`,
                );
                break;
              case 'coverImage':
                cb(
                  null,
                  `${process.env.UPLOADS_DIRECTORY || join(process.cwd(), 'uploads')}/cover-images`,
                );
                break;
              default:
                cb(
                  new Error('Invalid field name'),
                  process.env.UPLOADS_DIRECTORY ||
                    join(process.cwd(), 'uploads'),
                );
                break;
            }
          },
          filename: (
            _req: Express.Request,
            _file: Express.Multer.File,
            cb: (error: Error | null, filename: string) => void,
          ) => {
            const fileName = randomUUID();
            if (_file.fieldname === 'file') {
              cb(null, `${fileName}.epub`);
              return;
            } else if (_file.fieldname === 'coverImage') {
              cb(null, `${fileName}.jpg`);
              return;
            }
            cb(null, fileName);
          },
        }),
      },
    ),
  )
  createBook(
    @UploadedFiles()
    files: {
      file?: Express.Multer.File[];
      coverImage?: Express.Multer.File[];
    },
    @Body()
    createBookRequest: CreateBookRequest,
  ) {
    const request: CreateBookRequest = {
      ...createBookRequest,
      fileName: files.file!.at(0)!.filename,
      coverImageFileName: files.coverImage?.at(0)?.filename,
    };

    console.log('Create book request:', request);

    return this.createBookUseCase.execute(request);
  }

  @Delete(`:id`)
  @UseGuards(JwtAuthGuard)
  deleteBook(@Param('id') id: string) {
    const deleteBookRequest: DeleteBookRequest = {
      id,
    };
    return this.deleteBookUseCase.execute(deleteBookRequest);
  }

  @Put(`:id`)
  @UseGuards(JwtAuthGuard)
  updateBook(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    console.log('Update book DTO:', updateBookDto);
    const updateBookRequest: UpdateBookRequest = {
      id,
      ...updateBookDto,
    };
    return this.updateBookUseCase.execute(updateBookRequest);
  }
}
