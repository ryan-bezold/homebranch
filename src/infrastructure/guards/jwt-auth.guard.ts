import {
  Injectable,
  CanActivate,
  Inject,
  ExecutionContext,
} from '@nestjs/common';
import {
  InvalidTokenError,
  TokenExpiredError,
} from 'src/domain/exceptions/auth.exceptions';
import { Request } from 'express';
import { ITokenGateway } from '../../application/interfaces/jwt-token.gateway';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject('TokenGateway')
    private readonly tokenGateway: ITokenGateway,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const token = request.cookies['access_token'] as string;
    if (!token) {
      throw new InvalidTokenError('No token provided');
    }

    try {
      // Verify access token (stateless verification)
      const payload = await this.tokenGateway.verifyAccessToken(token);

      // Add user info to request
      request['user'] = {
        id: payload.userId,
        email: payload.email,
        roles: payload.roles,
      };

      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new InvalidTokenError('Token has expired');
      }
      throw new InvalidTokenError('Invalid token');
    }
  }
}
