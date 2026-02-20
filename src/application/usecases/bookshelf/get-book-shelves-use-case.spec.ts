/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { IBookShelfRepository } from '../../interfaces/bookshelf-repository';
import { Result } from 'src/core/result';
import { BookShelf } from 'src/domain/entities/bookshelf.entity';
import { GetBookShelvesUseCase } from './get-book-shelves-use-case.service';
import { PaginationResult } from 'src/core/pagination_result';

describe('GetBookShelvesUseCase', () => {
  let useCase: GetBookShelvesUseCase;
  let bookShelfRepository: jest.Mocked<IBookShelfRepository>;

  beforeEach(async () => {
    const mockBookShelfRepository = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBookShelvesUseCase,
        {
          provide: 'BookShelfRepository',
          useValue: mockBookShelfRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetBookShelvesUseCase>(GetBookShelvesUseCase);
    bookShelfRepository = module.get('BookShelfRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const mockBookShelves: BookShelf[] = [
      { id: 'shelf-1', title: 'Fiction', books: [] },
      { id: 'shelf-2', title: 'Non-Fiction', books: [] },
    ];

    it('should return paginated bookshelves', async () => {
      const paginatedResult: PaginationResult<BookShelf[]> = {
        data: mockBookShelves,
        limit: 10,
        offset: 0,
        total: 2,
        nextCursor: null,
      };

      bookShelfRepository.findAll.mockResolvedValue(
        Result.success(paginatedResult),
      );

      const result = await useCase.execute({ limit: 10, offset: 0 });

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().data).toHaveLength(2);
      expect(result.getValue().total).toBe(2);
      expect(bookShelfRepository.findAll).toHaveBeenCalledWith(10, 0);
    });

    it('should pass limit and offset to repository', async () => {
      const paginatedResult: PaginationResult<BookShelf[]> = {
        data: [],
        limit: 5,
        offset: 10,
        total: 0,
        nextCursor: null,
      };

      bookShelfRepository.findAll.mockResolvedValue(
        Result.success(paginatedResult),
      );

      await useCase.execute({ limit: 5, offset: 10 });

      expect(bookShelfRepository.findAll).toHaveBeenCalledWith(5, 10);
    });
  });
});
