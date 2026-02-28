import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/infrastructure/guards/jwt-auth.guard';
import { MapResultInterceptor } from '../interceptors/map_result.interceptor';
import { GetBookShelvesUseCase } from 'src/application/usecases/bookshelf/get-book-shelves-use-case.service';
import { GetBookShelfByIdUseCase } from 'src/application/usecases/bookshelf/get-book-shelf-by-id-use-case.service';
import { CreateBookShelfUseCase } from 'src/application/usecases/bookshelf/create-book-shelf-use-case.service';
import { DeleteBookShelfUseCase } from 'src/application/usecases/bookshelf/delete-book-shelf-use-case.service';
import { UpdateBookShelfUseCase } from 'src/application/usecases/bookshelf/update-book-shelf-use-case.service';
import { AddBookToBookShelfUseCase } from 'src/application/usecases/bookshelf/add-book-to-book-shelf-use-case.service';
import { RemoveBookFromBookShelfUseCase } from 'src/application/usecases/bookshelf/remove-book-from-book-shelf-use-case.service';
import { PaginatedQuery } from 'src/core/paginated-query';
import { DeleteBookShelfRequest } from 'src/application/contracts/bookshelf/delete-book-shelf-request';
import { UpdateBookShelfRequest } from 'src/application/contracts/bookshelf/update-book-shelf-request';
import { CreateBookShelfDto } from '../dtos/create-book-shelf.dto';
import { UpdateBookShelfDto } from '../dtos/update-book-shelf.dto';
import { AddBookToBookShelfDto } from '../dtos/add-book-to-book-shelf.dto';
import { RemoveBookFromBookShelfDto } from '../dtos/remove-book-from-book-shelf.dto';
import { GetBookShelfBooksUseCase } from 'src/application/usecases/bookshelf/get-book-shelf-books-use-case.service';
import { GetBookShelvesByBookUseCase } from 'src/application/usecases/bookshelf/get-book-shelves-by-book-use-case.service';

@Controller('book-shelves')
@UseInterceptors(MapResultInterceptor)
export class BookShelfController {
  constructor(
    private readonly getBookShelvesUseCase: GetBookShelvesUseCase,
    private readonly getBookShelfByIdUseCase: GetBookShelfByIdUseCase,
    private readonly getBookShelfBooksUseCase: GetBookShelfBooksUseCase,
    private readonly getBookShelvesByBookUseCase: GetBookShelvesByBookUseCase,
    private readonly createBookShelfUseCase: CreateBookShelfUseCase,
    private readonly deleteBookShelfUseCase: DeleteBookShelfUseCase,
    private readonly updateBookShelfUseCase: UpdateBookShelfUseCase,
    private readonly addBookToBookShelfUseCase: AddBookToBookShelfUseCase,
    private readonly removeBookFromBookShelfUseCase: RemoveBookFromBookShelfUseCase,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getBookShelves(@Req() req: Request, @Query() paginationDto: PaginatedQuery) {
    return this.getBookShelvesUseCase.execute({ ...paginationDto, userId: req['user']['id'] });
  }

  @Get('by-book/:bookId')
  @UseGuards(JwtAuthGuard)
  getBookShelvesByBook(@Param('bookId') bookId: string) {
    return this.getBookShelvesByBookUseCase.execute({ bookId });
  }

  @Get(`:id/books`)
  @UseGuards(JwtAuthGuard)
  getBookShelfBooksById(@Param('id') id: string) {
    return this.getBookShelfBooksUseCase.execute({ id });
  }

  @Get(`:id`)
  @UseGuards(JwtAuthGuard)
  getBookShelfById(@Param('id') id: string) {
    return this.getBookShelfByIdUseCase.execute({ id });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createBookShelf(
    @Req() req: Request,
    @Body()
    createBookShelfDto: CreateBookShelfDto,
  ) {
    return this.createBookShelfUseCase.execute({ ...createBookShelfDto, userId: req['user']['id'] });
  }

  @Delete(`:id`)
  @UseGuards(JwtAuthGuard)
  deleteBookShelf(@Param('id') id: string) {
    const deleteBookShelfRequest: DeleteBookShelfRequest = {
      id,
    };
    return this.deleteBookShelfUseCase.execute(deleteBookShelfRequest);
  }

  @Put(`:id`)
  @UseGuards(JwtAuthGuard)
  updateBookShelf(@Param('id') id: string, @Body() updateBookShelfDto: UpdateBookShelfDto) {
    const updateBookShelfRequest: UpdateBookShelfRequest = {
      id,
      ...updateBookShelfDto,
    };
    return this.updateBookShelfUseCase.execute(updateBookShelfRequest);
  }

  @Put(`:id/add-book`)
  @UseGuards(JwtAuthGuard)
  addBookToBookShelf(@Param('id') id: string, @Body() addBookToBookShelfDto: AddBookToBookShelfDto) {
    return this.addBookToBookShelfUseCase.execute({
      bookShelfId: id,
      bookId: addBookToBookShelfDto.bookId,
    });
  }

  @Put(`:id/remove-book`)
  @UseGuards(JwtAuthGuard)
  removeBookFromBookShelf(@Param('id') id: string, @Body() removeBookFromBookShelfDto: RemoveBookFromBookShelfDto) {
    return this.removeBookFromBookShelfUseCase.execute({
      bookShelfId: id,
      bookId: removeBookFromBookShelfDto.bookId,
    });
  }
}
