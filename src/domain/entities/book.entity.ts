export class Book {
  constructor(
    public id: string,
    public title: string,
    public author: string,
    public fileName: string,
    public isFavorite: boolean,
    public publishedYear?: number,
    public coverImageFileName?: string,
    public summary?: string,
    public uploadedByUserId?: string,
  ) {}
}
