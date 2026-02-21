/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { IBookShelfRepository } from 'src/application/interfaces/bookshelf-repository';
import { Result } from 'src/core/result';
import { BookShelf } from 'src/domain/entities/bookshelf.entity';
import { GetBookShelfByIdUseCase } from 'src/application/usecases/bookshelf/get-book-shelf-by-id-use-case.service';
import { BookShelfNotFoundFailure } from 'src/domain/failures/bookshelf.failures';

describe('GetBookShelfByIdUseCase', () => {
  let useCase: GetBookShelfByIdUseCase;
  let bookShelfRepository: jest.Mocked<IBookShelfRepository>;

  beforeEach(async () => {
    const mockBookShelfRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBookShelfByIdUseCase,
        {
          provide: 'BookShelfRepository',
          useValue: mockBookShelfRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetBookShelfByIdUseCase>(GetBookShelfByIdUseCase);
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

    it('should return a bookshelf when found', async () => {
      bookShelfRepository.findById.mockResolvedValue(
        Result.success(mockBookShelf),
      );

      const result = await useCase.execute({ id: 'bookshelf-123' });

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toEqual(mockBookShelf);
      expect(bookShelfRepository.findById).toHaveBeenCalledWith(
        'bookshelf-123',
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
    });
  });
});
