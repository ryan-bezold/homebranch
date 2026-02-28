import { Book } from 'src/domain/entities/book.entity';
import { BookShelf } from 'src/domain/entities/bookshelf.entity';
import { SavedPosition } from 'src/domain/entities/saved-position.entity';
import { mockBook } from './bookMocks';
import { mockBookShelf } from './bookShelfMocks';
import { mockSavedPosition } from './savedPositionMocks';

/**
 * Domain Entity Variants - Used for testing different scenarios and edge cases
 */

// Book variants
export const mockBookFavorite: Book = new Book(
  'book-fav',
  'Favorite Book',
  'Famous Author',
  'favorite-book.epub',
  true,
  2023,
  'favorite-cover.jpg',
);

export const mockBookMinimal: Book = new Book('book-min', 'Minimal Book', 'Test Author', 'minimal.epub', false);

export const mockBooks: Book[] = [mockBook, mockBookFavorite, mockBookMinimal];

// BookShelf variants
export const mockBookShelfWithBooks: BookShelf = new BookShelf('shelf-with-books', 'My Favorites', [
  mockBook,
  mockBookFavorite,
]);

export const mockBookShelfEmpty: BookShelf = new BookShelf('shelf-empty', 'Empty Shelf', []);

export const mockBookShelves: BookShelf[] = [mockBookShelf, mockBookShelfWithBooks, mockBookShelfEmpty];

// SavedPosition variants
export const mockSavedPositionMobile: SavedPosition = new SavedPosition(
  'book-123',
  'user-456',
  'epubcfi(/6/4!/4/2/1:50)',
  'Mobile App',
  new Date('2024-02-01'),
  new Date('2024-02-01'),
);

export const mockSavedPositionDesktop: SavedPosition = new SavedPosition(
  'book-789',
  'user-456',
  'epubcfi(/6/4!/4/2/1:75)',
  'Desktop Browser',
  new Date('2024-02-02'),
  new Date('2024-02-02'),
);

export const mockSavedPositions: SavedPosition[] = [
  mockSavedPosition,
  mockSavedPositionMobile,
  mockSavedPositionDesktop,
];
