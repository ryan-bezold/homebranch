import { Test, TestingModule } from '@nestjs/testing';
import { IBookRepository } from 'src/application/interfaces/book-repository';
import { GetBooksByAuthorUseCase } from 'src/application/usecases/author/get-books-by-author.usecase';
import { mock } from 'jest-mock-extended';
import { mockBook } from 'test/mocks/bookMocks';
import { Result } from 'src/core/result';
import { PaginationResult } from 'src/core/pagination_result';
import { Book } from 'src/domain/entities/book.entity';
import Mocked = jest.Mocked;

describe('GetBooksByAuthorUseCase', () => {
  let useCase: GetBooksByAuthorUseCase;
  let bookRepository: Mocked<IBookRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBooksByAuthorUseCase,
        {
          provide: 'BookRepository',
          useValue: mock<IBookRepository>(),
        },
      ],
    }).compile();

    useCase = module.get<GetBooksByAuthorUseCase>(GetBooksByAuthorUseCase);
    bookRepository = module.get('BookRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Returns books by author when no query is provided', async () => {
    const paginationResult: PaginationResult<Book[]> = {
      data: [mockBook],
      limit: 10,
      offset: 0,
      total: 1,
      nextCursor: null,
    };
    bookRepository.findByAuthor.mockResolvedValueOnce(Result.ok(paginationResult));

    const result = await useCase.execute({ name: 'Test Author', limit: 10, offset: 0 });

    expect(bookRepository.findByAuthor).toHaveBeenCalledWith('Test Author', 10, 0);
    expect(bookRepository.searchByAuthorAndTitle).not.toHaveBeenCalled();
    expect(result.isSuccess()).toBe(true);
    expect(result.value!.data).toEqual([mockBook]);
  });

  test('Searches books by author and title when query is provided', async () => {
    const paginationResult: PaginationResult<Book[]> = {
      data: [mockBook],
      limit: 10,
      offset: 0,
      total: 1,
      nextCursor: null,
    };
    bookRepository.searchByAuthorAndTitle.mockResolvedValueOnce(Result.ok(paginationResult));

    const result = await useCase.execute({
      name: 'Test Author',
      query: 'Test',
      limit: 10,
      offset: 0,
    });

    expect(bookRepository.searchByAuthorAndTitle).toHaveBeenCalledWith('Test Author', 'Test', 10, 0);
    expect(bookRepository.findByAuthor).not.toHaveBeenCalled();
    expect(result.isSuccess()).toBe(true);
  });

  test('Returns empty list when author has no books', async () => {
    const paginationResult: PaginationResult<Book[]> = {
      data: [],
      limit: 10,
      offset: 0,
      total: 0,
      nextCursor: null,
    };
    bookRepository.findByAuthor.mockResolvedValueOnce(Result.ok(paginationResult));

    const result = await useCase.execute({ name: 'Unknown Author', limit: 10, offset: 0 });

    expect(result.isSuccess()).toBe(true);
    expect(result.value!.data).toEqual([]);
    expect(result.value!.total).toBe(0);
  });
});
