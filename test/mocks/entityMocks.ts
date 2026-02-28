import { BookEntity } from 'src/infrastructure/database/book.entity';
import { BookShelfEntity } from 'src/infrastructure/database/book-shelf.entity';
import { SavedPositionEntity } from 'src/infrastructure/database/saved-position.entity';
import { mockBook } from './bookMocks';
import { mockBookShelf } from './bookShelfMocks';
import { mockSavedPosition } from './savedPositionMocks';

/**
 * Database Entity Mocks - Used for persistence layer testing and mapper tests
 * These are derived from the domain entity mocks above
 */

export const mockBookEntity: BookEntity = {
  id: mockBook.id,
  title: mockBook.title,
  author: mockBook.author,
  fileName: mockBook.fileName,
  isFavorite: mockBook.isFavorite,
  publishedYear: mockBook.publishedYear,
  coverImageFileName: mockBook.coverImageFileName,
  uploadedByUserId: mockBook.uploadedByUserId,
};

export const mockBookShelfEntity: BookShelfEntity = {
  id: mockBookShelf.id,
  title: mockBookShelf.title,
  books: [],
};

export const mockSavedPositionEntity: SavedPositionEntity = {
  bookId: mockSavedPosition.bookId,
  userId: mockSavedPosition.userId,
  position: mockSavedPosition.position,
  deviceName: mockSavedPosition.deviceName,
  percentage: mockSavedPosition.percentage,
  createdAt: mockSavedPosition.createdAt,
  updatedAt: mockSavedPosition.updatedAt,
};

/**
 * Entity variants with different field values for testing edge cases
 */

export const mockBookEntityWithAllFields: BookEntity = {
  ...mockBookEntity,
  publishedYear: 2023,
  coverImageFileName: 'cover.jpg',
};

export const mockBookEntityWithoutOptional: BookEntity = {
  ...mockBookEntity,
  publishedYear: undefined,
  coverImageFileName: undefined,
};

export const mockBookShelfEntityWithBooks: BookShelfEntity = {
  ...mockBookShelfEntity,
  books: [mockBookEntity],
};

export const mockBookShelfEntityEmpty: BookShelfEntity = {
  ...mockBookShelfEntity,
  books: [],
};
