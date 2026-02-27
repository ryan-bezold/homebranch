import { Test, TestingModule } from '@nestjs/testing';
import { IAuthorRepository } from 'src/application/interfaces/author-repository';
import { GetAuthorUseCase } from 'src/application/usecases/author/get-author.usecase';
import { OpenLibraryGateway } from 'src/infrastructure/gateways/open-library.gateway';
import { mock } from 'jest-mock-extended';
import { mockAuthor, mockAuthorWithoutEnrichment } from 'test/mocks/authorMocks';
import { Result } from 'src/core/result';
import { AuthorNotFoundFailure } from 'src/domain/failures/author.failures';
import Mocked = jest.Mocked;

describe('GetAuthorUseCase', () => {
  let useCase: GetAuthorUseCase;
  let authorRepository: Mocked<IAuthorRepository>;
  let openLibraryGateway: Mocked<OpenLibraryGateway>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAuthorUseCase,
        {
          provide: 'AuthorRepository',
          useValue: mock<IAuthorRepository>(),
        },
        {
          provide: OpenLibraryGateway,
          useValue: mock<OpenLibraryGateway>(),
        },
      ],
    }).compile();

    useCase = module.get<GetAuthorUseCase>(GetAuthorUseCase);
    authorRepository = module.get('AuthorRepository');
    openLibraryGateway = module.get(OpenLibraryGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Returns existing author record when found', async () => {
    authorRepository.findByName.mockResolvedValueOnce(Result.ok(mockAuthor));

    const result = await useCase.execute({ name: 'Jane Austen' });

    expect(authorRepository.findByName).toHaveBeenCalledWith('Jane Austen');
    expect(openLibraryGateway.findAuthorEnrichment).not.toHaveBeenCalled();
    expect(authorRepository.create).not.toHaveBeenCalled();
    expect(result.isSuccess()).toBe(true);
    expect(result.value).toEqual(mockAuthor);
  });

  test('Creates a new author with Open Library enrichment when not found', async () => {
    authorRepository.findByName.mockResolvedValueOnce(
      Result.fail(new AuthorNotFoundFailure()),
    );
    openLibraryGateway.findAuthorEnrichment.mockResolvedValueOnce({
      biography: 'An English novelist.',
      photoUrl: 'https://covers.openlibrary.org/a/olid/OL21594A-L.jpg',
    });
    authorRepository.create.mockResolvedValueOnce(Result.ok(mockAuthor));

    const result = await useCase.execute({ name: 'Jane Austen' });

    expect(authorRepository.findByName).toHaveBeenCalledWith('Jane Austen');
    expect(openLibraryGateway.findAuthorEnrichment).toHaveBeenCalledWith('Jane Austen');
    expect(authorRepository.create).toHaveBeenCalledTimes(1);
    const createdAuthor = authorRepository.create.mock.calls[0][0];
    expect(createdAuthor.name).toBe('Jane Austen');
    expect(createdAuthor.biography).toBe('An English novelist.');
    expect(createdAuthor.profilePictureUrl).toBe(
      'https://covers.openlibrary.org/a/olid/OL21594A-L.jpg',
    );
    expect(result.isSuccess()).toBe(true);
  });

  test('Creates a new author without enrichment when Open Library returns nothing', async () => {
    authorRepository.findByName.mockResolvedValueOnce(
      Result.fail(new AuthorNotFoundFailure()),
    );
    openLibraryGateway.findAuthorEnrichment.mockResolvedValueOnce({
      biography: null,
      photoUrl: null,
    });
    authorRepository.create.mockResolvedValueOnce(
      Result.ok(mockAuthorWithoutEnrichment),
    );

    const result = await useCase.execute({ name: 'Charles Dickens' });

    const createdAuthor = authorRepository.create.mock.calls[0][0];
    expect(createdAuthor.biography).toBeNull();
    expect(createdAuthor.profilePictureUrl).toBeNull();
    expect(result.isSuccess()).toBe(true);
  });
});
