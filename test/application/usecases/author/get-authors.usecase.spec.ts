import { Test, TestingModule } from '@nestjs/testing';
import { IAuthorRepository } from 'src/application/interfaces/author-repository';
import { GetAuthorsUseCase } from 'src/application/usecases/author/get-authors.usecase';
import { mock } from 'jest-mock-extended';
import { mockAuthor } from 'test/mocks/authorMocks';
import { Result } from 'src/core/result';
import { PaginationResult } from 'src/core/pagination_result';
import { Author } from 'src/domain/entities/author.entity';
import Mocked = jest.Mocked;

describe('GetAuthorsUseCase', () => {
  let useCase: GetAuthorsUseCase;
  let authorRepository: Mocked<IAuthorRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAuthorsUseCase,
        {
          provide: 'AuthorRepository',
          useValue: mock<IAuthorRepository>(),
        },
      ],
    }).compile();

    useCase = module.get<GetAuthorsUseCase>(GetAuthorsUseCase);
    authorRepository = module.get('AuthorRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Successfully retrieves paginated authors', async () => {
    const paginationResult: PaginationResult<Author[]> = {
      data: [mockAuthor],
      limit: 10,
      offset: 0,
      total: 1,
      nextCursor: null,
    };
    authorRepository.findAll.mockResolvedValueOnce(Result.ok(paginationResult));

    const result = await useCase.execute({ limit: 10, offset: 0 });

    expect(authorRepository.findAll).toHaveBeenCalledWith(undefined, 10, 0);
    expect(result.isSuccess()).toBe(true);
    expect(result.value).toEqual(paginationResult);
  });

  test('Passes search query to repository', async () => {
    const paginationResult: PaginationResult<Author[]> = {
      data: [mockAuthor],
      limit: 10,
      offset: 0,
      total: 1,
      nextCursor: null,
    };
    authorRepository.findAll.mockResolvedValueOnce(Result.ok(paginationResult));

    const result = await useCase.execute({ query: 'jane', limit: 10, offset: 0 });

    expect(authorRepository.findAll).toHaveBeenCalledWith('jane', 10, 0);
    expect(result.isSuccess()).toBe(true);
  });

  test('Returns empty list when no authors exist', async () => {
    const paginationResult: PaginationResult<Author[]> = {
      data: [],
      limit: 10,
      offset: 0,
      total: 0,
      nextCursor: null,
    };
    authorRepository.findAll.mockResolvedValueOnce(Result.ok(paginationResult));

    const result = await useCase.execute({ limit: 10, offset: 0 });

    expect(result.isSuccess()).toBe(true);
    expect(result.value!.data).toEqual([]);
  });
});
