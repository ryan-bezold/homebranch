import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  InvalidTokenError,
  TokenExpiredError,
} from 'src/domain/exceptions/auth.exceptions';
import { ForbiddenError } from 'src/domain/exceptions/forbidden.exception';
import { Request } from 'express';
import { ITokenGateway } from 'src/application/interfaces/jwt-token.gateway';
import { IUserRepository } from 'src/application/interfaces/user-repository';
import { IRoleRepository } from 'src/application/interfaces/role-repository';
import { UserFactory } from 'src/domain/entities/user.factory';
import { User } from 'src/domain/entities/user.entity';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject('TokenGateway')
    private readonly tokenGateway: ITokenGateway,
    @Inject('UserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('RoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  private logger = new Logger('JwtAuthGuard');

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const token = request.cookies['access_token'] as string;
    if (!token) {
      throw new InvalidTokenError('No token provided');
    }

    try {
      // Verify access token (stateless verification)
      const payload = await this.tokenGateway.verifyAccessToken(token);

      // Look up or create local user record
      const findResult = await this.userRepository.findById(payload.userId);

      let user: User;
      if (findResult.isSuccess()) {
        user = findResult.getValue();
      } else {
        this.logger.log('Saving new user');
        // Auto-create user on first authentication
        const newUser = UserFactory.create(
          payload.userId,
          payload.email,
          payload.email,
          false,
        );
        const createResult = await this.userRepository.create(newUser);
        user = createResult.getValue();

        // Auto-assign admin role to the first user
        const userCount = await this.userRepository.count();
        if (userCount === 1) {
          this.logger.log('Assigning admin role to new user');
          const adminRoleResult = await this.roleRepository.findByName('admin');
          if (adminRoleResult.isSuccess()) {
            user.role = adminRoleResult.getValue();
            const updateResult = await this.userRepository.update(
              user.id,
              user,
            );
            user = updateResult.getValue();
          }
        }
      }

      // Check restriction status
      if (user.isRestricted) {
        throw new ForbiddenError('Account is restricted');
      }

      // Add user info to request
      request['user'] = {
        id: user.id,
        username: user.username,
        email: user.email,
        isRestricted: user.isRestricted,
        role: user.role,
      };

      return true;
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw error;
      }
      if (error instanceof TokenExpiredError) {
        throw new InvalidTokenError('Token has expired');
      }
      if (error instanceof InvalidTokenError) {
        throw error;
      }
      throw new InvalidTokenError('Invalid token');
    }
  }
}
