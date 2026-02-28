import { Test, TestingModule } from '@nestjs/testing';
import { IAuthorRepository } from 'src/application/interfaces/author-repository';
import { UploadAuthorProfilePictureUseCase } from 'src/application/usecases/author/upload-author-profile-picture.usecase';
import { mock } from 'jest-mock-extended';
import { mockAuthor } from 'test/mocks/authorMocks';
import { Result } from 'src/core/result';
import { Author } from 'src/domain/entities/author.entity';
import { AuthorNotFoundFailure } from 'src/domain/failures/author.failures';
import Mocked = jest.Mocked;

describe('UploadAuthorProfilePictureUseCase', () => {
  let useCase: UploadAuthorProfilePictureUseCase;
  let authorRepository: Mocked<IAuthorRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadAuthorProfilePictureUseCase,
        {
          provide: 'AuthorRepository',
          useValue: mock<IAuthorRepository>(),
        },
      ],
    }).compile();

    useCase = module.get<UploadAuthorProfilePictureUseCase>(UploadAuthorProfilePictureUseCase);
    authorRepository = module.get('AuthorRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Successfully updates author profile picture URL', async () => {
    const newUrl = 'http://localhost:3000/uploads/author-images/new-uuid.jpg';
    const updatedAuthor = new Author(mockAuthor.id, mockAuthor.name, mockAuthor.biography, newUrl);
    authorRepository.findByName.mockResolvedValueOnce(Result.ok(mockAuthor));
    authorRepository.updateByName.mockResolvedValueOnce(Result.ok(updatedAuthor));

    const result = await useCase.execute({
      name: 'Jane Austen',
      profilePictureUrl: newUrl,
    });

    expect(authorRepository.findByName).toHaveBeenCalledWith('Jane Austen');
    expect(authorRepository.updateByName).toHaveBeenCalledWith(
      'Jane Austen',
      expect.objectContaining({ profilePictureUrl: newUrl }),
    );
    expect(result.isSuccess()).toBe(true);
    expect(result.value!.profilePictureUrl).toBe(newUrl);
  });

  test('Preserves existing biography when updating profile picture', async () => {
    const newUrl = 'http://localhost:3000/uploads/author-images/new-uuid.jpg';
    authorRepository.findByName.mockResolvedValueOnce(Result.ok(mockAuthor));
    authorRepository.updateByName.mockResolvedValueOnce(Result.ok(mockAuthor));

    await useCase.execute({ name: 'Jane Austen', profilePictureUrl: newUrl });

    const updatedAuthorArg = authorRepository.updateByName.mock.calls[0][1];
    expect(updatedAuthorArg.biography).toBe(mockAuthor.biography);
  });

  test('Fails when author is not found', async () => {
    authorRepository.findByName.mockResolvedValueOnce(Result.fail(new AuthorNotFoundFailure()));

    const result = await useCase.execute({
      name: 'Unknown Author',
      profilePictureUrl: 'http://localhost:3000/uploads/author-images/uuid.jpg',
    });

    expect(authorRepository.updateByName).not.toHaveBeenCalled();
    expect(result.isSuccess()).toBe(false);
    expect(result.failure).toBeInstanceOf(AuthorNotFoundFailure);
  });
});
