/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { IBookShelfRepository } from 'src/application/interfaces/bookshelf-repository';
import { Result } from 'src/core/result';
import { BookShelf } from 'src/domain/entities/bookshelf.entity';
import { BookShelfNotFoundFailure } from 'src/domain/failures/bookshelf.failures';
import { UpdateBookShelfUseCase } from 'src/application/usecases/bookshelf/update-book-shelf-use-case.service';
import { UpdateBookShelfRequest } from 'src/application/contracts/bookshelf/update-book-shelf-request';

describe('UpdateBookShelfUseCase', () => {
  let useCase: UpdateBookShelfUseCase;
  let bookShelfRepository: jest.Mocked<IBookShelfRepository>;

  beforeEach(async () => {
    const mockBookShelfRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateBookShelfUseCase,
        {
          provide: 'BookShelfRepository',
          useValue: mockBookShelfRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateBookShelfUseCase>(UpdateBookShelfUseCase);
    bookShelfRepository = module.get('BookShelfRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const mockRequest: UpdateBookShelfRequest = {
      id: '1234',
      title: 'updated-title',
    };

    const mockBookShelf: BookShelf = {
      id: '1234',
      title: 'My Bookshelf',
      books: [],
    };

    const updatedBookShelf: BookShelf = {
      id: '1234',
      title: 'updated-title',
      books: [],
    };

    it('should successfully update a book shelf when it exists', async () => {
      bookShelfRepository.findById.mockResolvedValueOnce(
        Result.success(mockBookShelf),
      );

      bookShelfRepository.update.mockResolvedValueOnce(
        Result.success(updatedBookShelf),
      );

      const result = await useCase.execute(mockRequest);

      expect(result.isSuccess()).toBe(true);
      expect(bookShelfRepository.findById).toHaveBeenCalledWith('1234');
      expect(bookShelfRepository.update).toHaveBeenCalledWith(
        '1234',
        expect.objectContaining({ title: 'updated-title' }),
      );
    });

    it('should return failure when bookshelf is not found', async () => {
      bookShelfRepository.findById.mockResolvedValueOnce(
        Result.failure<BookShelf>(new BookShelfNotFoundFailure()),
      );

      const result = await useCase.execute(mockRequest);

      expect(result.isFailure()).toBe(true);
      expect(bookShelfRepository.findById).toHaveBeenCalledWith('1234');
      expect(bookShelfRepository.update).not.toHaveBeenCalled();
    });
  });
});
