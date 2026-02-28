import { Test, TestingModule } from '@nestjs/testing';
import { IBookRepository } from 'src/application/interfaces/book-repository';
import { FetchBookSummaryUseCase } from 'src/application/usecases/book/fetch-book-summary.usecase';
import { mock } from 'jest-mock-extended';
import { mockBook } from 'test/mocks/bookMocks';
import { Result, UnexpectedFailure } from 'src/core/result';
import { OpenLibraryGateway } from 'src/infrastructure/gateways/open-library.gateway';
import { BookNotFoundFailure } from 'src/domain/failures/book.failures';
import Mocked = jest.Mocked;

describe('FetchBookSummaryUseCase', () => {
  let useCase: FetchBookSummaryUseCase;
  let bookRepository: Mocked<IBookRepository>;
  let openLibraryGateway: Mocked<OpenLibraryGateway>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FetchBookSummaryUseCase,
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

    useCase = module.get<FetchBookSummaryUseCase>(FetchBookSummaryUseCase);
    bookRepository = module.get('BookRepository');
    openLibraryGateway = module.get(OpenLibraryGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Fetches and persists summary from Open Library', async () => {
    bookRepository.findById.mockResolvedValueOnce(Result.ok(mockBook));
    openLibraryGateway.findBookSummary.mockResolvedValueOnce('A fetched summary.');
    bookRepository.update.mockResolvedValueOnce(Result.ok({ ...mockBook, summary: 'A fetched summary.' }));

    const result = await useCase.execute({ id: mockBook.id });

    expect(result.isSuccess()).toBe(true);
    expect(openLibraryGateway.findBookSummary).toHaveBeenCalledWith(mockBook.title, mockBook.author);
    const updatedBook = bookRepository.update.mock.calls[0][1];
    expect(updatedBook.summary).toBe('A fetched summary.');
  });

  test('Succeeds without updating summary when Open Library returns null', async () => {
    bookRepository.findById.mockResolvedValueOnce(Result.ok(mockBook));
    openLibraryGateway.findBookSummary.mockResolvedValueOnce(null);

    const result = await useCase.execute({ id: mockBook.id });

    expect(result.isSuccess()).toBe(true);
    expect(bookRepository.update).not.toHaveBeenCalled();
  });

  test('Returns failure when book is not found', async () => {
    bookRepository.findById.mockResolvedValueOnce(Result.fail(new BookNotFoundFailure()));

    const result = await useCase.execute({ id: 'nonexistent-id' });

    expect(result.isFailure()).toBe(true);
    expect(bookRepository.update).not.toHaveBeenCalled();
    expect(openLibraryGateway.findBookSummary).not.toHaveBeenCalled();
  });

  test('Returns failure when repository update fails', async () => {
    bookRepository.findById.mockResolvedValueOnce(Result.ok(mockBook));
    openLibraryGateway.findBookSummary.mockResolvedValueOnce('A fetched summary.');
    bookRepository.update.mockResolvedValueOnce(Result.fail(new UnexpectedFailure('Database error')));

    const result = await useCase.execute({ id: mockBook.id });

    expect(result.isFailure()).toBe(true);
  });
});
