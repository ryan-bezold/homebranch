export class Author {
  constructor(
    public id: string | null,
    public name: string,
    public biography: string | null,
    public profilePictureUrl: string | null,
    public bookCount?: number,
  ) {}
}
