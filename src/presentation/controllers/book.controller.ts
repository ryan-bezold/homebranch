import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  StreamableFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateBookRequest } from 'src/application/contracts/book/create-book-request';
import { UpdateBookRequest } from 'src/application/contracts/book/update-book-request';
import { CreateBookUseCase } from 'src/application/usecases/book/create-book.usecase';
import { DeleteBookUseCase } from 'src/application/usecases/book/delete-book.usecase';
import { GetBooksUseCase } from 'src/application/usecases/book/get-books.usecase';
import { UpdateBookUseCase } from 'src/application/usecases/book/update-book.usecase';
import { UpdateBookDto } from '../dtos/update-book.dto';
import { GetBookByIdUseCase } from 'src/application/usecases/book/get-book-by-id.usecase';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { join } from 'path';
import { DeleteBookRequest } from 'src/application/contracts/book/delete-book-request';
import { GetFavoriteBooksUseCase } from 'src/application/usecases/book/get-favorite-books-use-case.service';
import { JwtAuthGuard } from 'src/infrastructure/guards/jwt-auth.guard';
import { MapResultInterceptor } from '../interceptors/map_result.interceptor';
import { PaginatedQuery } from 'src/core/paginated-query';
import { DownloadBookUseCase } from 'src/application/usecases/book/download-book.usecase';
import { createReadStream, existsSync } from 'fs';
import { basename } from 'path';
import { Response, Request } from 'express';
import { FetchBookSummaryUseCase } from 'src/application/usecases/book/fetch-book-summary.usecase';

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
    private readonly downloadBookUseCase: DownloadBookUseCase,
    private readonly fetchBookSummaryUseCase: FetchBookSummaryUseCase,
  ) {}

  private readonly logger = new Logger('BookController');
  @Get()
  @UseGuards(JwtAuthGuard)
  getBooks(@Query() paginationDto: PaginatedQuery) {
    this.logger.log(`Getting books with title ${paginationDto.query}`);
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
    @Req() request: Request,
    @UploadedFiles()
    files: {
      file?: Express.Multer.File[];
      coverImage?: Express.Multer.File[];
    },
    @Body()
    createBookRequest: CreateBookRequest,
  ) {
    const bookRequest: CreateBookRequest = {
      ...createBookRequest,
      fileName: files.file!.at(0)!.filename,
      coverImageFileName: files.coverImage?.at(0)?.filename,
      uploadedByUserId: request['user'].id,
    };

    console.log('Create book request:', bookRequest);

    return this.createBookUseCase.execute(bookRequest);
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

  @Post(':id/fetch-summary')
  @UseGuards(JwtAuthGuard)
  fetchBookSummary(@Param('id') id: string) {
    return this.fetchBookSummaryUseCase.execute({ id });
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  async downloadBook(
    @Param('id') id: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile | void> {
    const result = await this.downloadBookUseCase.execute({ id });

    if (result.isFailure()) {
      response
        .status(404)
        .json({ success: false, error: result.failure!.code, message: result.failure!.message });
      return;
    }

    const book = result.value!;
    const sanitizedTitle =
      book.title.replace(/[^\w\s\-]/g, '').trim() || 'book';
    const uploadsDirectory = process.env.UPLOADS_DIRECTORY || './uploads';
    const safeFileName = basename(book.fileName);
    const filePath = join(uploadsDirectory, 'books', safeFileName);

    if (!existsSync(filePath)) {
      response
        .status(404)
        .json({ success: false, error: 'BOOK_FILE_NOT_FOUND', message: 'Book file not found on server' });
      return;
    }

    const fileStream = createReadStream(filePath);
    fileStream.on('error', (streamError) => {
      this.logger.error(`Error streaming book file: ${streamError.message}`);
      fileStream.destroy();
    });

    return new StreamableFile(fileStream, {
      type: 'application/epub+zip',
      disposition: `attachment; filename="${sanitizedTitle}.epub"`,
    });
  }
}
