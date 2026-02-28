import { Test, TestingModule } from '@nestjs/testing';
import { IAuthorRepository } from 'src/application/interfaces/author-repository';
import { UpdateAuthorUseCase } from 'src/application/usecases/author/update-author.usecase';
import { mock } from 'jest-mock-extended';
import { mockAuthor } from 'test/mocks/authorMocks';
import { Result } from 'src/core/result';
import { Author } from 'src/domain/entities/author.entity';
import { AuthorNotFoundFailure } from 'src/domain/failures/author.failures';
import Mocked = jest.Mocked;

describe('UpdateAuthorUseCase', () => {
  let useCase: UpdateAuthorUseCase;
  let authorRepository: Mocked<IAuthorRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateAuthorUseCase,
        {
          provide: 'AuthorRepository',
          useValue: mock<IAuthorRepository>(),
        },
      ],
    }).compile();

    useCase = module.get<UpdateAuthorUseCase>(UpdateAuthorUseCase);
    authorRepository = module.get('AuthorRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Successfully updates author biography', async () => {
    const updatedAuthor = new Author(
      mockAuthor.id,
      mockAuthor.name,
      'Updated biography text.',
      mockAuthor.profilePictureUrl,
    );
    authorRepository.findByName.mockResolvedValueOnce(Result.ok(mockAuthor));
    authorRepository.updateByName.mockResolvedValueOnce(Result.ok(updatedAuthor));

    const result = await useCase.execute({
      name: 'Jane Austen',
      biography: 'Updated biography text.',
    });

    expect(authorRepository.findByName).toHaveBeenCalledWith('Jane Austen');
    expect(authorRepository.updateByName).toHaveBeenCalledWith(
      'Jane Austen',
      expect.objectContaining({ biography: 'Updated biography text.' }),
    );
    expect(result.isSuccess()).toBe(true);
    expect(result.value!.biography).toBe('Updated biography text.');
  });

  test('Preserves existing biography when biography is not provided', async () => {
    authorRepository.findByName.mockResolvedValueOnce(Result.ok(mockAuthor));
    authorRepository.updateByName.mockResolvedValueOnce(Result.ok(mockAuthor));

    await useCase.execute({ name: 'Jane Austen' });

    const updatedAuthorArg = authorRepository.updateByName.mock.calls[0][1];
    expect(updatedAuthorArg.biography).toBe(mockAuthor.biography);
  });

  test('Fails when author is not found', async () => {
    authorRepository.findByName.mockResolvedValueOnce(Result.fail(new AuthorNotFoundFailure()));

    const result = await useCase.execute({
      name: 'Unknown Author',
      biography: 'Some text',
    });

    expect(authorRepository.updateByName).not.toHaveBeenCalled();
    expect(result.isSuccess()).toBe(false);
    expect(result.failure).toBeInstanceOf(AuthorNotFoundFailure);
  });
});
