/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { IBookRepository } from 'src/application/interfaces/book-repository';
import { IBookShelfRepository } from 'src/application/interfaces/bookshelf-repository';
import { Result } from 'src/core/result';
import { BookShelf } from 'src/domain/entities/bookshelf.entity';
import { Book } from 'src/domain/entities/book.entity';
import { AddBookToBookShelfRequest } from 'src/application/contracts/bookshelf/add-book-to-book-shelf-request';
import { BookNotFoundFailure } from 'src/domain/failures/book.failures';
import { AddBookToBookShelfUseCase } from 'src/application/usecases/bookshelf/add-book-to-book-shelf-use-case.service';
import { BookShelfNotFoundFailure } from 'src/domain/failures/bookshelf.failures';

describe('AddBookToBookShelfUseCase', () => {
  let useCase: AddBookToBookShelfUseCase;
  let bookShelfRepository: jest.Mocked<IBookShelfRepository>;
  let bookRepository: jest.Mocked<IBookRepository>;

  beforeEach(async () => {
    const mockBookShelfRepository = {
      findByTitle: jest.fn(),
      addBook: jest.fn(),
      removeBook: jest.fn(),
      findByBookId: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockBookRepository = {
      findByAuthor: jest.fn(),
      findFavorites: jest.fn(),
      findByTitle: jest.fn(),
      findByBookShelfId: jest.fn(),
      searchByTitle: jest.fn(),
      searchFavoritesByTitle: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddBookToBookShelfUseCase,
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

    useCase = module.get<AddBookToBookShelfUseCase>(AddBookToBookShelfUseCase);
    bookShelfRepository = module.get('BookShelfRepository');
    bookRepository = module.get('BookRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const mockRequest: AddBookToBookShelfRequest = {
      bookShelfId: 'bookshelf-123',
      bookId: 'book-456',
    };

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
      books: [],
    };

    it('should successfully add book to bookshelf when both exist and book is not already in shelf', async () => {
      // Mock successful bookshelf retrieval
      bookShelfRepository.findById.mockResolvedValue(
        Result.success(mockBookShelf),
      );

      // Mock successful book retrieval
      bookRepository.findById.mockResolvedValue(Result.success(mockBook));

      // Mock successful update
      const updatedBookShelf = { ...mockBookShelf, books: [mockBook] };
      bookShelfRepository.update.mockResolvedValue(
        Result.success(updatedBookShelf),
      );

      const result = await useCase.execute(mockRequest);

      expect(result.isSuccess()).toBe(true);
      expect(bookShelfRepository.findById).toHaveBeenCalledWith(
        'bookshelf-123',
      );
      expect(bookRepository.findById).toHaveBeenCalledWith('book-456');
      expect(bookShelfRepository.addBook).toHaveBeenCalledWith(
        'bookshelf-123',
        'book-456',
      );
    });

    it('should return failure when bookshelf is not found', async () => {
      // Mock bookshelf not found
      const failure = Result.failure<BookShelf>(new BookShelfNotFoundFailure());
      bookShelfRepository.findById.mockResolvedValue(failure);

      const result = await useCase.execute(mockRequest);

      expect(result.isSuccess()).toBe(false);
      expect(result.getFailure()).toBeInstanceOf(BookShelfNotFoundFailure);
      expect(bookShelfRepository.findById).toHaveBeenCalledWith(
        'bookshelf-123',
      );
      expect(bookRepository.findById).not.toHaveBeenCalled();
      expect(bookShelfRepository.addBook).not.toHaveBeenCalled();
    });

    it('should return BookNotFoundFailure when book is not found', async () => {
      mockBookShelf.books = [];
      // Mock successful bookshelf retrieval
      bookShelfRepository.findById.mockResolvedValue(
        Result.success(mockBookShelf),
      );

      // Mock book not found
      const failure = Result.failure<Book>(new BookNotFoundFailure());
      bookRepository.findById.mockResolvedValue(failure);

      const result = await useCase.execute(mockRequest);

      expect(result.isSuccess()).toBe(false);
      expect(result.getFailure()).toBeInstanceOf(BookNotFoundFailure);
      expect(bookShelfRepository.findById).toHaveBeenCalledWith(
        'bookshelf-123',
      );
      expect(bookRepository.findById).toHaveBeenCalledWith('book-456');
      expect(bookShelfRepository.addBook).not.toHaveBeenCalled();
    });

    it('should return success immediately when book is already in bookshelf', async () => {
      // Create bookshelf that already contains the book
      const bookShelfWithBook = { ...mockBookShelf, books: [mockBook] };
      bookShelfRepository.findById.mockResolvedValue(
        Result.success(bookShelfWithBook),
      );

      const result = await useCase.execute(mockRequest);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toEqual(bookShelfWithBook);
      expect(bookShelfRepository.findById).toHaveBeenCalledWith(
        'bookshelf-123',
      );
      expect(bookRepository.findById).not.toHaveBeenCalled();
      expect(bookShelfRepository.addBook).not.toHaveBeenCalled();
    });
  });
});
