import { Test, TestingModule } from '@nestjs/testing';
import { IBookRepository } from 'src/application/interfaces/book-repository';
import { CreateBookUseCase } from 'src/application/usecases/book/create-book.usecase';
import { mock } from 'jest-mock-extended';
import { mockBook } from 'test/mocks/bookMocks';
import { Result, UnexpectedFailure } from 'src/core/result';
import { OpenLibraryGateway } from 'src/infrastructure/gateways/open-library.gateway';
import Mocked = jest.Mocked;

describe('CreateBookUseCase', () => {
  let useCase: CreateBookUseCase;
  let bookRepository: Mocked<IBookRepository>;
  let openLibraryGateway: Mocked<OpenLibraryGateway>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateBookUseCase,
        {
          provide: 'BookRepository',
          useValue: mock<IBookRepository>(),
        },
        {
          provide: OpenLibraryGateway,
          useValue: mock<OpenLibraryGateway>(),
        },
      ],
    }).compile();

    useCase = module.get<CreateBookUseCase>(CreateBookUseCase);
    bookRepository = module.get('BookRepository');
    openLibraryGateway = module.get(OpenLibraryGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Successfully creates a book', async () => {
    openLibraryGateway.findBookSummary.mockResolvedValueOnce(null);
    bookRepository.create.mockResolvedValueOnce(Result.ok(mockBook));

    const result = await useCase.execute({
      title: 'Test Book',
      author: 'Test Author',
      fileName: 'test-book.epub',
      isFavorite: false,
      publishedYear: '2001',
      coverImageFileName: 'test-cover.jpg',
      uploadedByUserId: 'user-123',
    });

    expect(result.isSuccess()).toBe(true);
    expect(bookRepository.create).toHaveBeenCalledTimes(1);
    expect(bookRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Test Book', author: 'Test Author' }),
    );

    const calledWith = bookRepository.create.mock.calls[0][0];
    expect(calledWith.id).toBeDefined();
    expect(typeof calledWith.id).toBe('string');
  });

  test('Successfully creates a book with minimal fields', async () => {
    openLibraryGateway.findBookSummary.mockResolvedValueOnce(null);
    bookRepository.create.mockResolvedValueOnce(Result.ok(mockBook));

    const result = await useCase.execute({
      title: 'Test Book',
      author: 'Test Author',
      fileName: 'test-book.epub',
      uploadedByUserId: 'user-123',
    });

    expect(result.isSuccess()).toBe(true);
    expect(bookRepository.create).toHaveBeenCalledTimes(1);

    const calledWith = bookRepository.create.mock.calls[0][0];
    expect(calledWith.isFavorite).toBe(false);
    expect(calledWith.publishedYear).toBeUndefined();
    expect(calledWith.coverImageFileName).toBeUndefined();
  });

  test('Ignores invalid published year', async () => {
    openLibraryGateway.findBookSummary.mockResolvedValueOnce(null);
    bookRepository.create.mockResolvedValueOnce(Result.ok(mockBook));

    const result = await useCase.execute({
      title: 'Test Book',
      author: 'Test Author',
      fileName: 'test-book.epub',
      publishedYear: 'not-a-number',
      uploadedByUserId: 'user-123',
    });

    expect(result.isSuccess()).toBe(true);

    const calledWith = bookRepository.create.mock.calls[0][0];
    expect(calledWith.publishedYear).toBeUndefined();
  });

  test('Successfully parses valid published year', async () => {
    openLibraryGateway.findBookSummary.mockResolvedValueOnce(null);
    bookRepository.create.mockResolvedValueOnce(Result.ok(mockBook));

    const result = await useCase.execute({
      title: 'Test Book',
      author: 'Test Author',
      fileName: 'test-book.epub',
      publishedYear: '2015',
      uploadedByUserId: 'user-123',
    });

    expect(result.isSuccess()).toBe(true);

    const calledWith = bookRepository.create.mock.calls[0][0];
    expect(calledWith.publishedYear).toBe(2015);
  });

  test('Successfully handles isFavorite flag', async () => {
    openLibraryGateway.findBookSummary.mockResolvedValueOnce(null);
    bookRepository.create.mockResolvedValueOnce(Result.ok(mockBook));

    const result = await useCase.execute({
      title: 'Test Book',
      author: 'Test Author',
      fileName: 'test-book.epub',
      isFavorite: true,
      uploadedByUserId: 'user-123',
    });

    expect(result.isSuccess()).toBe(true);

    const calledWith = bookRepository.create.mock.calls[0][0];
    expect(calledWith.isFavorite).toBe(true);
  });

  test('Sets summary from Open Library when available', async () => {
    openLibraryGateway.findBookSummary.mockResolvedValueOnce('A summary from Open Library.');
    bookRepository.create.mockResolvedValueOnce(Result.ok(mockBook));

    const result = await useCase.execute({
      title: 'Test Book',
      author: 'Test Author',
      fileName: 'test-book.epub',
      uploadedByUserId: 'user-123',
    });

    expect(result.isSuccess()).toBe(true);
    expect(openLibraryGateway.findBookSummary).toHaveBeenCalledWith('Test Book', 'Test Author');

    const calledWith = bookRepository.create.mock.calls[0][0];
    expect(calledWith.summary).toBe('A summary from Open Library.');
  });

  test('Creates book without summary when Open Library returns null', async () => {
    openLibraryGateway.findBookSummary.mockResolvedValueOnce(null);
    bookRepository.create.mockResolvedValueOnce(Result.ok(mockBook));

    const result = await useCase.execute({
      title: 'Test Book',
      author: 'Test Author',
      fileName: 'test-book.epub',
      uploadedByUserId: 'user-123',
    });

    expect(result.isSuccess()).toBe(true);

    const calledWith = bookRepository.create.mock.calls[0][0];
    expect(calledWith.summary).toBeUndefined();
  });

  test('Fails when repository create fails', async () => {
    openLibraryGateway.findBookSummary.mockResolvedValueOnce(null);
    const error = new UnexpectedFailure('Database error');
    bookRepository.create.mockResolvedValueOnce(Result.fail(error));

    const result = await useCase.execute({
      title: 'Test Book',
      author: 'Test Author',
      fileName: 'test-book.epub',
      uploadedByUserId: 'user-123',
    });

    expect(result.isFailure()).toBe(true);
    expect(bookRepository.create).toHaveBeenCalledTimes(1);
  });
});
