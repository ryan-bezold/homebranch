export class SavedPosition {
  constructor(
    public bookId: string,
    public userId: string,
    public position: string,
    public deviceName: string,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}
