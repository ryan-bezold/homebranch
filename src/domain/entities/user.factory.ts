import { Role } from 'src/domain/entities/role.entity';
import { User } from 'src/domain/entities/user.entity';

export class UserFactory {
  static create(
    id: string,
    username: string,
    email: string,
    isRestricted: boolean = false,
    role?: Role,
  ): User {
    if (!username || !email) {
      throw new Error('Username and email are required to create a user.');
    }

    return new User(id, username, email, isRestricted, role);
  }
}
