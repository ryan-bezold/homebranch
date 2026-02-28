/* eslint-disable */
import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from 'src/infrastructure/guards/jwt-auth.guard';
import { ITokenGateway } from 'src/application/interfaces/jwt-token.gateway';
import { JwtPayload } from 'src/domain/value-objects/token-payload.value-object';
import {
  InvalidTokenError,
  TokenExpiredError,
} from 'src/domain/exceptions/auth.exceptions';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let tokenGateway: jest.Mocked<ITokenGateway>;

  const mockPayload = new JwtPayload(
    'user-1',
    'alice@example.com',
    ['USER'],
    new Date(),
    new Date(Date.now() + 3600000),
  );

  function createMockContext(token?: string): ExecutionContext {
    const request = {
      cookies: { access_token: token },
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: 'TokenGateway',
          useValue: {
            verifyAccessToken: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    tokenGateway = module.get('TokenGateway');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true and attach user to request for a valid token', async () => {
    tokenGateway.verifyAccessToken.mockResolvedValue(mockPayload);

    const context = createMockContext('valid-token');
    const result = await guard.canActivate(context);

    expect(result).toBe(true);

    const request = context.switchToHttp().getRequest();
    expect(request['user']).toEqual({
      id: mockPayload.userId,
      email: mockPayload.email,
      roles: mockPayload.roles,
    });
  });

  it('should attach roles from the JWT payload to the request user', async () => {
    const adminPayload = new JwtPayload(
      'user-admin',
      'admin@example.com',
      ['ADMIN'],
      new Date(),
      new Date(Date.now() + 3600000),
    );
    tokenGateway.verifyAccessToken.mockResolvedValue(adminPayload);

    const context = createMockContext('admin-token');
    await guard.canActivate(context);

    const request = context.switchToHttp().getRequest();
    expect(request['user'].roles).toEqual(['ADMIN']);
  });

  it('should throw InvalidTokenError when no token is provided', async () => {
    const context = createMockContext(undefined);
    await expect(guard.canActivate(context)).rejects.toThrow(InvalidTokenError);
  });

  it('should throw InvalidTokenError for an invalid token', async () => {
    tokenGateway.verifyAccessToken.mockRejectedValue(new Error('bad token'));

    const context = createMockContext('bad-token');
    await expect(guard.canActivate(context)).rejects.toThrow(InvalidTokenError);
  });

  it('should throw InvalidTokenError when token is expired', async () => {
    tokenGateway.verifyAccessToken.mockRejectedValue(new TokenExpiredError());

    const context = createMockContext('expired-token');
    await expect(guard.canActivate(context)).rejects.toThrow(InvalidTokenError);
  });
});
