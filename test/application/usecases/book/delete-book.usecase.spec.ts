import { Test, TestingModule } from '@nestjs/testing';
import { IBookRepository } from 'src/application/interfaces/book-repository';
import { DeleteBookUseCase } from 'src/application/usecases/book/delete-book.usecase';
import { mock } from 'jest-mock-extended';
import { mockBook, mockBookFavorite } from 'test/mocks/bookMocks';
import { Result } from 'src/core/result';
import { BookNotFoundFailure, DeleteBookForbiddenFailure } from 'src/domain/failures/book.failures';
import Mocked = jest.Mocked;

describe('DeleteBookUseCase', () => {
  let useCase: DeleteBookUseCase;
  let bookRepository: Mocked<IBookRepository>;

  const bookNotFoundFailure = new BookNotFoundFailure();
  const deleteBookForbiddenFailure = new DeleteBookForbiddenFailure();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteBookUseCase,
        {
          provide: 'BookRepository',
          useValue: mock<IBookRepository>(),
        },
      ],
    }).compile();

    useCase = module.get<DeleteBookUseCase>(DeleteBookUseCase);
    bookRepository = module.get('BookRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Successfully deletes a book when requested by the owner', async () => {
    bookRepository.findById.mockResolvedValueOnce(Result.ok(mockBook));
    bookRepository.delete.mockResolvedValueOnce(Result.ok(mockBook));

    const result = await useCase.execute({
      id: mockBook.id,
      requestingUserId: mockBook.uploadedByUserId!,
      requestingUserRole: 'USER',
    });

    expect(bookRepository.findById).toHaveBeenCalledTimes(1);
    expect(bookRepository.findById).toHaveBeenCalledWith(mockBook.id);
    expect(bookRepository.delete).toHaveBeenCalledTimes(1);
    expect(bookRepository.delete).toHaveBeenCalledWith(mockBook.id);
    expect(result.isSuccess()).toBe(true);
    expect(result.value).toEqual(mockBook);
  });

  test('Successfully deletes a book when requested by an admin', async () => {
    bookRepository.findById.mockResolvedValueOnce(Result.ok(mockBook));
    bookRepository.delete.mockResolvedValueOnce(Result.ok(mockBook));

    const result = await useCase.execute({
      id: mockBook.id,
      requestingUserId: 'different-user-id',
      requestingUserRole: 'ADMIN',
    });

    expect(bookRepository.delete).toHaveBeenCalledTimes(1);
    expect(result.isSuccess()).toBe(true);
  });

  test('Fails with forbidden when non-owner non-admin requests deletion', async () => {
    bookRepository.findById.mockResolvedValueOnce(Result.ok(mockBook));

    const result = await useCase.execute({
      id: mockBook.id,
      requestingUserId: 'different-user-id',
      requestingUserRole: 'USER',
    });

    expect(bookRepository.findById).toHaveBeenCalledTimes(1);
    expect(bookRepository.delete).not.toHaveBeenCalled();
    expect(result.isFailure()).toBe(true);
    expect(result.failure).toEqual(deleteBookForbiddenFailure);
  });

  test('Successfully deletes a book without an owner when requested by any user', async () => {
    bookRepository.findById.mockResolvedValueOnce(Result.ok(mockBookFavorite));
    bookRepository.delete.mockResolvedValueOnce(Result.ok(mockBookFavorite));

    const result = await useCase.execute({
      id: mockBookFavorite.id,
      requestingUserId: 'any-user-id',
      requestingUserRole: 'USER',
    });

    expect(bookRepository.delete).toHaveBeenCalledTimes(1);
    expect(result.isSuccess()).toBe(true);
  });

  test('Fails when book not found', async () => {
    bookRepository.findById.mockResolvedValueOnce(Result.fail(bookNotFoundFailure));

    const result = await useCase.execute({
      id: 'non-existent-id',
      requestingUserId: 'user-123',
      requestingUserRole: 'USER',
    });

    expect(bookRepository.findById).toHaveBeenCalledTimes(1);
    expect(bookRepository.findById).toHaveBeenCalledWith('non-existent-id');
    expect(bookRepository.delete).not.toHaveBeenCalled();
    expect(result.isFailure()).toBe(true);
    expect(result.failure).toEqual(bookNotFoundFailure);
  });
});
