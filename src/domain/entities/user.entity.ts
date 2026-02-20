import { Role } from 'src/domain/entities/role.entity';

export class User {
  constructor(
    public id: string,
    public username: string,
    public email: string,
    public isRestricted: boolean,
    public role?: Role,
  ) {}
}
