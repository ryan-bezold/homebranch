import { Test, TestingModule } from '@nestjs/testing';
import { IBookRepository } from 'src/application/interfaces/book-repository';
import { GetBooksUseCase } from 'src/application/usecases/book/get-books.usecase';
import { mock } from 'jest-mock-extended';
import { mockBook } from 'test/mocks/bookMocks';
import { Result } from 'src/core/result';
import { PaginationResult } from 'src/core/pagination_result';
import { Book } from 'src/domain/entities/book.entity';
import Mocked = jest.Mocked;

describe('GetBooksUseCase', () => {
  let useCase: GetBooksUseCase;
  let bookRepository: Mocked<IBookRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBooksUseCase,
        {
          provide: 'BookRepository',
          useValue: mock<IBookRepository>(),
        },
      ],
    }).compile();

    useCase = module.get<GetBooksUseCase>(GetBooksUseCase);
    bookRepository = module.get('BookRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Successfully retrieves paginated books', async () => {
    const mockBooks = [
      mockBook,
      new Book('book-789', 'Another Book', 'Another Author', 'another.epub', false, 2022, 'another-cover.jpg'),
    ];
    const paginationResult: PaginationResult<Book[]> = {
      data: mockBooks,
      limit: 10,
      offset: 0,
      total: 2,
      nextCursor: null,
    };
    bookRepository.findAll.mockResolvedValueOnce(Result.ok(paginationResult));

    const result = await useCase.execute({ limit: 10, offset: 0, userId: 'user-123' });

    expect(bookRepository.findAll).toHaveBeenCalledTimes(1);
    expect(bookRepository.findAll).toHaveBeenCalledWith(10, 0, 'user-123');
    expect(result.isSuccess()).toBe(true);
    expect(result.value).toEqual(paginationResult);
  });

  test('Successfully searches books by title', async () => {
    const mockBooks = [mockBook];
    const paginationResult: PaginationResult<Book[]> = {
      data: mockBooks,
      limit: 10,
      offset: 0,
      total: 1,
      nextCursor: null,
    };
    bookRepository.searchByTitle.mockResolvedValueOnce(Result.ok(paginationResult));

    const result = await useCase.execute({ limit: 10, offset: 0, query: 'Test Book', userId: 'user-123' });

    expect(bookRepository.searchByTitle).toHaveBeenCalledTimes(1);
    expect(bookRepository.searchByTitle).toHaveBeenCalledWith('Test Book', 10, 0, 'user-123');
    expect(bookRepository.findAll).not.toHaveBeenCalled();
    expect(result.isSuccess()).toBe(true);
    expect(result.value).toEqual(paginationResult);
  });

  test('Returns empty array when no books exist', async () => {
    const paginationResult: PaginationResult<Book[]> = {
      data: [],
      limit: 10,
      offset: 0,
      total: 0,
      nextCursor: null,
    };
    bookRepository.findAll.mockResolvedValueOnce(Result.ok(paginationResult));

    const result = await useCase.execute({ limit: 10, offset: 0, userId: 'user-123' });

    expect(bookRepository.findAll).toHaveBeenCalledTimes(1);
    expect(result.isSuccess()).toBe(true);
    expect(result.value!.data).toEqual([]);
  });
});
