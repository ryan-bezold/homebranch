/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { IBookShelfRepository } from 'src/application/interfaces/bookshelf-repository';
import { Result } from 'src/core/result';
import { BookShelf } from 'src/domain/entities/bookshelf.entity';
import { DeleteBookShelfUseCase } from 'src/application/usecases/bookshelf/delete-book-shelf-use-case.service';
import { BookShelfNotFoundFailure } from 'src/domain/failures/bookshelf.failures';

describe('DeleteBookShelfUseCase', () => {
  let useCase: DeleteBookShelfUseCase;
  let bookShelfRepository: jest.Mocked<IBookShelfRepository>;

  beforeEach(async () => {
    const mockBookShelfRepository = {
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteBookShelfUseCase,
        {
          provide: 'BookShelfRepository',
          useValue: mockBookShelfRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteBookShelfUseCase>(DeleteBookShelfUseCase);
    bookShelfRepository = module.get('BookShelfRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const mockBookShelf: BookShelf = {
      id: 'bookshelf-123',
      title: 'My Bookshelf',
      books: [],
    };

    it('should successfully delete a bookshelf', async () => {
      bookShelfRepository.delete.mockResolvedValue(
        Result.success(mockBookShelf),
      );

      const result = await useCase.execute({ id: 'bookshelf-123' });

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toEqual(mockBookShelf);
      expect(bookShelfRepository.delete).toHaveBeenCalledWith('bookshelf-123');
    });

    it('should return failure when bookshelf is not found', async () => {
      bookShelfRepository.delete.mockResolvedValue(
        Result.failure(new BookShelfNotFoundFailure()),
      );

      const result = await useCase.execute({ id: 'nonexistent-id' });

      expect(result.isSuccess()).toBe(false);
      expect(result.getFailure()).toBeInstanceOf(BookShelfNotFoundFailure);
      expect(bookShelfRepository.delete).toHaveBeenCalledWith('nonexistent-id');
    });
  });
});
