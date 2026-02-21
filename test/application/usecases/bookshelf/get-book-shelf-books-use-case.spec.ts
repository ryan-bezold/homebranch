/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { IBookShelfRepository } from 'src/application/interfaces/bookshelf-repository';
import { IBookRepository } from 'src/application/interfaces/book-repository';
import { Result } from 'src/core/result';
import { BookShelf } from 'src/domain/entities/bookshelf.entity';
import { Book } from 'src/domain/entities/book.entity';
import { GetBookShelfBooksUseCase } from 'src/application/usecases/bookshelf/get-book-shelf-books-use-case.service';
import { BookShelfNotFoundFailure } from 'src/domain/failures/bookshelf.failures';
import { PaginationResult } from 'src/core/pagination_result';

describe('GetBookShelfBooksUseCase', () => {
  let useCase: GetBookShelfBooksUseCase;
  let bookShelfRepository: jest.Mocked<IBookShelfRepository>;
  let bookRepository: jest.Mocked<IBookRepository>;

  beforeEach(async () => {
    const mockBookShelfRepository = {
      findById: jest.fn(),
    };

    const mockBookRepository = {
      findByBookShelfId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBookShelfBooksUseCase,
        {
          provide: 'BookShelfRepository',
          useValue: mockBookShelfRepository,
        },
        {
          provide: 'BookRepository',
          useValue: mockBookRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetBookShelfBooksUseCase>(GetBookShelfBooksUseCase);
    bookShelfRepository = module.get('BookShelfRepository');
    bookRepository = module.get('BookRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const mockBook: Book = {
      id: 'book-456',
      title: 'Test Book',
      author: 'Test Author',
      isFavorite: false,
      fileName: 'test-book.epub',
    };

    const mockBookShelf: BookShelf = {
      id: 'bookshelf-123',
      title: 'My Bookshelf',
      books: [mockBook],
    };

    it('should return books for an existing bookshelf', async () => {
      bookShelfRepository.findById.mockResolvedValue(
        Result.success(mockBookShelf),
      );

      const paginatedResult: PaginationResult<Book[]> = {
        data: [mockBook],
        limit: undefined,
        offset: undefined,
        total: 1,
        nextCursor: null,
      };

      bookRepository.findByBookShelfId.mockResolvedValue(
        Result.success(paginatedResult),
      );

      const result = await useCase.execute({ id: 'bookshelf-123' });

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().data).toHaveLength(1);
      expect(result.getValue().data[0]).toEqual(mockBook);
      expect(bookShelfRepository.findById).toHaveBeenCalledWith(
        'bookshelf-123',
      );
      expect(bookRepository.findByBookShelfId).toHaveBeenCalledWith(
        mockBookShelf,
      );
    });

    it('should return failure when bookshelf is not found', async () => {
      bookShelfRepository.findById.mockResolvedValue(
        Result.failure(new BookShelfNotFoundFailure()),
      );

      const result = await useCase.execute({ id: 'nonexistent-id' });

      expect(result.isSuccess()).toBe(false);
      expect(result.getFailure()).toBeInstanceOf(BookShelfNotFoundFailure);
      expect(bookShelfRepository.findById).toHaveBeenCalledWith(
        'nonexistent-id',
      );
      expect(bookRepository.findByBookShelfId).not.toHaveBeenCalled();
    });
  });
});
