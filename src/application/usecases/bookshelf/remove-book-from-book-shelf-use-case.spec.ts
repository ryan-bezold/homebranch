/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { IBookShelfRepository } from '../../interfaces/bookshelf-repository';
import { Result } from 'src/core/result';
import { BookShelf } from 'src/domain/entities/bookshelf.entity';
import { Book } from 'src/domain/entities/book.entity';
import { BookShelfNotFoundFailure } from 'src/domain/failures/bookshelf.failures';
import { RemoveBookFromBookShelfUseCase } from './remove-book-from-book-shelf-use-case.service';
import { RemoveBookFromBookShelfRequest } from '../../contracts/bookshelf/remove-book-from-book-shelf-request';

describe('RemoveBookFromBookShelfUseCase', () => {
  let useCase: RemoveBookFromBookShelfUseCase;
  let bookShelfRepository: jest.Mocked<IBookShelfRepository>;

  beforeEach(async () => {
    const mockBookShelfRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveBookFromBookShelfUseCase,
        {
          provide: 'BookShelfRepository',
          useValue: mockBookShelfRepository,
        },
      ],
    }).compile();

    useCase = module.get<RemoveBookFromBookShelfUseCase>(RemoveBookFromBookShelfUseCase);
    bookShelfRepository = module.get('BookShelfRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const mockRequest: RemoveBookFromBookShelfRequest = {
      bookShelfId: 'bookshelf-123',
      bookId: 'book-456',
    };

    const mockBook: Book = {
      id: 'book-456',
      title: 'Book',
      author: 'Author',
      fileName: 'file-name.epub',
      isFavorite: false,
    }

    const mockBookShelf: BookShelf = {
      id: 'bookshelf-123',
      title: 'My Bookshelf',
      books: [mockBook],
    };

    it('should successfully remove a book from bookshelf when both exist and book is in shelf', async () => {
      // Mock successful bookshelf retrieval
      bookShelfRepository.findById.mockResolvedValue(
        Result.success(mockBookShelf),
      );

      // Mock successful update
      const updatedBookShelf = { ...mockBookShelf, books: [] };
      bookShelfRepository.update.mockResolvedValue(
        Result.success(updatedBookShelf),
      );

      const result = await useCase.execute(mockRequest);

      expect(result.isSuccess()).toBe(true);
      expect(bookShelfRepository.findById).toHaveBeenCalledWith(
        'bookshelf-123',
      );
      expect(bookShelfRepository.update).toHaveBeenCalledWith(
        'bookshelf-123',
        expect.objectContaining({
          books: [],
        }),
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
      expect(bookShelfRepository.update).not.toHaveBeenCalled();
    });

    it('should return success immediately when book is not in bookshelf', async () => {
      // Create bookshelf that already contains the book
      const bookShelfWithoutBook = { ...mockBookShelf, books: [] };
      bookShelfRepository.findById.mockResolvedValue(
        Result.success(bookShelfWithoutBook),
      );

      const result = await useCase.execute(mockRequest);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toEqual(bookShelfWithoutBook);
      expect(bookShelfRepository.findById).toHaveBeenCalledWith(
        'bookshelf-123',
      );
      expect(bookShelfRepository.update).not.toHaveBeenCalled();
    });
  });
});
