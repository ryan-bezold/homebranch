/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { IBookShelfRepository } from '../../interfaces/bookshelf-repository';
import { Result } from 'src/core/result';
import { BookShelf } from 'src/domain/entities/bookshelf.entity';
import { CreateBookShelfUseCase } from './create-book-shelf-use-case.service';
import { CreateBookShelfRequest } from '../../contracts/bookshelf/create-book-shelf-request';

describe('CreateBookShelfUseCase', () => {
  let useCase: CreateBookShelfUseCase;
  let bookShelfRepository: jest.Mocked<IBookShelfRepository>;

  beforeEach(async () => {
    const mockBookShelfRepository = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateBookShelfUseCase,
        {
          provide: 'BookShelfRepository',
          useValue: mockBookShelfRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateBookShelfUseCase>(CreateBookShelfUseCase);
    bookShelfRepository = module.get('BookShelfRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const mockRequest: CreateBookShelfRequest = {
      title: 'My Bookshelf',
    };

    it('should successfully create a bookshelf', async () => {
      const createdBookShelf: BookShelf = {
        id: expect.any(String),
        title: 'My Bookshelf',
        books: [],
      };

      bookShelfRepository.create.mockResolvedValue(
        Result.success(createdBookShelf),
      );

      const result = await useCase.execute(mockRequest);

      expect(result.isSuccess()).toBe(true);
      expect(bookShelfRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'My Bookshelf',
          books: [],
        }),
      );
    });

    it('should generate a UUID for the new bookshelf', async () => {
      bookShelfRepository.create.mockResolvedValue(
        Result.success({ id: 'any-id', title: 'My Bookshelf', books: [] }),
      );

      await useCase.execute(mockRequest);

      const calledWith = bookShelfRepository.create.mock.calls[0][0];
      expect(calledWith.id).toBeDefined();
      expect(typeof calledWith.id).toBe('string');
      expect(calledWith.id.length).toBeGreaterThan(0);
    });
  });
});
