/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { BookShelfController } from 'src/presentation/controllers/book-shelf.controller';
import { Result } from 'src/core/result';
import { BookShelf } from 'src/domain/entities/bookshelf.entity';
import { Book } from 'src/domain/entities/book.entity';
import { BookShelfNotFoundFailure } from 'src/domain/failures/bookshelf.failures';
import { GetBookShelvesUseCase } from 'src/application/usecases/bookshelf/get-book-shelves-use-case.service';
import { GetBookShelfByIdUseCase } from 'src/application/usecases/bookshelf/get-book-shelf-by-id-use-case.service';
import { GetBookShelfBooksUseCase } from 'src/application/usecases/bookshelf/get-book-shelf-books-use-case.service';
import { CreateBookShelfUseCase } from 'src/application/usecases/bookshelf/create-book-shelf-use-case.service';
import { DeleteBookShelfUseCase } from 'src/application/usecases/bookshelf/delete-book-shelf-use-case.service';
import { UpdateBookShelfUseCase } from 'src/application/usecases/bookshelf/update-book-shelf-use-case.service';
import { AddBookToBookShelfUseCase } from 'src/application/usecases/bookshelf/add-book-to-book-shelf-use-case.service';
import { RemoveBookFromBookShelfUseCase } from 'src/application/usecases/bookshelf/remove-book-from-book-shelf-use-case.service';
import { JwtAuthGuard } from 'src/infrastructure/guards/jwt-auth.guard';

describe('BookShelfController (e2e)', () => {
  let app: INestApplication<App>;

  const mockBookShelf: BookShelf = {
    id: 'shelf-1',
    title: 'Fiction',
    books: [],
  };

  const mockBook: Book = {
    id: 'book-1',
    title: 'Test Book',
    author: 'Author',
    fileName: 'test.epub',
    isFavorite: false,
  };

  const mockGetBookShelvesUseCase = { execute: jest.fn() };
  const mockGetBookShelfByIdUseCase = { execute: jest.fn() };
  const mockGetBookShelfBooksUseCase = { execute: jest.fn() };
  const mockCreateBookShelfUseCase = { execute: jest.fn() };
  const mockDeleteBookShelfUseCase = { execute: jest.fn() };
  const mockUpdateBookShelfUseCase = { execute: jest.fn() };
  const mockAddBookToBookShelfUseCase = { execute: jest.fn() };
  const mockRemoveBookFromBookShelfUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [BookShelfController],
      providers: [
        { provide: 'TokenGateway', useValue: { verifyAccessToken: jest.fn() } },
        { provide: GetBookShelvesUseCase, useValue: mockGetBookShelvesUseCase },
        { provide: GetBookShelfByIdUseCase, useValue: mockGetBookShelfByIdUseCase },
        { provide: GetBookShelfBooksUseCase, useValue: mockGetBookShelfBooksUseCase },
        { provide: CreateBookShelfUseCase, useValue: mockCreateBookShelfUseCase },
        { provide: DeleteBookShelfUseCase, useValue: mockDeleteBookShelfUseCase },
        { provide: UpdateBookShelfUseCase, useValue: mockUpdateBookShelfUseCase },
        { provide: AddBookToBookShelfUseCase, useValue: mockAddBookToBookShelfUseCase },
        { provide: RemoveBookFromBookShelfUseCase, useValue: mockRemoveBookFromBookShelfUseCase },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  describe('GET /book-shelves', () => {
    it('should return paginated bookshelves', async () => {
      mockGetBookShelvesUseCase.execute.mockResolvedValue(
        Result.success({
          data: [mockBookShelf],
          limit: 10,
          offset: 0,
          total: 1,
          nextCursor: null,
        }),
      );

      const response = await request(app.getHttpServer())
        .get('/book-shelves')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.value.data).toHaveLength(1);
    });
  });

  describe('GET /book-shelves/:id', () => {
    it('should return a bookshelf by id', async () => {
      mockGetBookShelfByIdUseCase.execute.mockResolvedValue(
        Result.success(mockBookShelf),
      );

      const response = await request(app.getHttpServer())
        .get('/book-shelves/shelf-1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.value.title).toBe('Fiction');
    });

    it('should return error when bookshelf not found', async () => {
      mockGetBookShelfByIdUseCase.execute.mockResolvedValue(
        Result.failure(new BookShelfNotFoundFailure()),
      );

      const response = await request(app.getHttpServer())
        .get('/book-shelves/nonexistent');

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /book-shelves/:id/books', () => {
    it('should return books for a bookshelf', async () => {
      mockGetBookShelfBooksUseCase.execute.mockResolvedValue(
        Result.success({
          data: [mockBook],
          limit: undefined,
          offset: undefined,
          total: 1,
          nextCursor: null,
        }),
      );

      const response = await request(app.getHttpServer())
        .get('/book-shelves/shelf-1/books')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.value.data).toHaveLength(1);
    });
  });

  describe('POST /book-shelves', () => {
    it('should create a new bookshelf', async () => {
      mockCreateBookShelfUseCase.execute.mockResolvedValue(
        Result.success(mockBookShelf),
      );

      const response = await request(app.getHttpServer())
        .post('/book-shelves')
        .send({ title: 'Fiction' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockCreateBookShelfUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Fiction' }),
      );
    });
  });

  describe('PUT /book-shelves/:id', () => {
    it('should update a bookshelf', async () => {
      const updatedShelf = { ...mockBookShelf, title: 'Updated Title' };
      mockUpdateBookShelfUseCase.execute.mockResolvedValue(
        Result.success(updatedShelf),
      );

      const response = await request(app.getHttpServer())
        .put('/book-shelves/shelf-1')
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockUpdateBookShelfUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'shelf-1', title: 'Updated Title' }),
      );
    });
  });

  describe('DELETE /book-shelves/:id', () => {
    it('should delete a bookshelf', async () => {
      mockDeleteBookShelfUseCase.execute.mockResolvedValue(
        Result.success(mockBookShelf),
      );

      const response = await request(app.getHttpServer())
        .delete('/book-shelves/shelf-1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockDeleteBookShelfUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'shelf-1' }),
      );
    });
  });

  describe('PUT /book-shelves/:id/add-book', () => {
    it('should add a book to the bookshelf using route param as bookShelfId', async () => {
      const shelfWithBook = { ...mockBookShelf, books: [mockBook] };
      mockAddBookToBookShelfUseCase.execute.mockResolvedValue(
        Result.success(shelfWithBook),
      );

      const response = await request(app.getHttpServer())
        .put('/book-shelves/shelf-1/add-book')
        .send({ bookId: 'book-1' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockAddBookToBookShelfUseCase.execute).toHaveBeenCalledWith({
        bookShelfId: 'shelf-1',
        bookId: 'book-1',
      });
    });
  });

  describe('PUT /book-shelves/:id/remove-book', () => {
    it('should remove a book from the bookshelf using route param as bookShelfId', async () => {
      mockRemoveBookFromBookShelfUseCase.execute.mockResolvedValue(
        Result.success(mockBookShelf),
      );

      const response = await request(app.getHttpServer())
        .put('/book-shelves/shelf-1/remove-book')
        .send({ bookId: 'book-1' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockRemoveBookFromBookShelfUseCase.execute).toHaveBeenCalledWith({
        bookShelfId: 'shelf-1',
        bookId: 'book-1',
      });
    });
  });
});
