import { Test, TestingModule } from '@nestjs/testing';
import { IBookRepository } from 'src/application/interfaces/book-repository';
import { GetFavoriteBooksUseCase } from 'src/application/usecases/book/get-favorite-books-use-case.service';
import { mock } from 'jest-mock-extended';
import { mockBook } from 'test/mocks/bookMocks';
import { Result } from 'src/core/result';
import { PaginationResult } from 'src/core/pagination_result';
import { Book } from 'src/domain/entities/book.entity';
import Mocked = jest.Mocked;

describe('GetFavoriteBooksUseCase', () => {
  let useCase: GetFavoriteBooksUseCase;
  let bookRepository: Mocked<IBookRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetFavoriteBooksUseCase,
        {
          provide: 'BookRepository',
          useValue: mock<IBookRepository>(),
        },
      ],
    }).compile();

    useCase = module.get<GetFavoriteBooksUseCase>(GetFavoriteBooksUseCase);
    bookRepository = module.get('BookRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Successfully retrieves paginated favorite books', async () => {
    const favoriteBook = { ...mockBook, isFavorite: true };
    const anotherFavorite = new Book(
      'book-999',
      'Another Favorite',
      'Another Author',
      'another.epub',
      true,
      2023,
      'another-cover.jpg',
    );
    const mockBooks = [favoriteBook, anotherFavorite];
    const paginationResult: PaginationResult<Book[]> = {
      data: mockBooks,
      limit: 10,
      offset: 0,
      total: 2,
      nextCursor: null,
    };
    bookRepository.findFavorites.mockResolvedValueOnce(Result.ok(paginationResult));

    const result = await useCase.execute({ limit: 10, offset: 0, userId: 'user-123' });

    expect(bookRepository.findFavorites).toHaveBeenCalledTimes(1);
    expect(bookRepository.findFavorites).toHaveBeenCalledWith(10, 0, 'user-123');
    expect(bookRepository.searchFavoritesByTitle).not.toHaveBeenCalled();
    expect(result.isSuccess()).toBe(true);
    expect(result.value).toEqual(paginationResult);
  });

  test('Successfully searches favorite books by title', async () => {
    const favoriteBook = { ...mockBook, isFavorite: true };
    const mockBooks = [favoriteBook];
    const paginationResult: PaginationResult<Book[]> = {
      data: mockBooks,
      limit: 10,
      offset: 0,
      total: 1,
      nextCursor: null,
    };
    bookRepository.searchFavoritesByTitle.mockResolvedValueOnce(Result.ok(paginationResult));

    const result = await useCase.execute({
      limit: 10,
      offset: 0,
      query: 'Test Book',
      userId: 'user-123',
    });

    expect(bookRepository.searchFavoritesByTitle).toHaveBeenCalledTimes(1);
    expect(bookRepository.searchFavoritesByTitle).toHaveBeenCalledWith('Test Book', 10, 0, 'user-123');
    expect(bookRepository.findFavorites).not.toHaveBeenCalled();
    expect(result.isSuccess()).toBe(true);
    expect(result.value).toEqual(paginationResult);
  });

  test('Returns empty array when no favorite books exist', async () => {
    const paginationResult: PaginationResult<Book[]> = {
      data: [],
      limit: 10,
      offset: 0,
      total: 0,
      nextCursor: null,
    };
    bookRepository.findFavorites.mockResolvedValueOnce(Result.ok(paginationResult));

    const result = await useCase.execute({ limit: 10, offset: 0, userId: 'user-123' });

    expect(bookRepository.findFavorites).toHaveBeenCalledTimes(1);
    expect(result.isSuccess()).toBe(true);
    expect(result.value!.data).toEqual([]);
  });
});
