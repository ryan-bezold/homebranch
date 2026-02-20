/* eslint-disable */
import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ITokenGateway } from 'src/application/interfaces/jwt-token.gateway';
import { IUserRepository } from 'src/application/interfaces/user-repository';
import { IRoleRepository } from 'src/application/interfaces/role-repository';
import { Result } from 'src/core/result';
import { User } from 'src/domain/entities/user.entity';
import { Role } from 'src/domain/entities/role.entity';
import { Permission } from 'src/domain/value-objects/permission.enum';
import { JwtPayload } from 'src/domain/value-objects/token-payload.value-object';
import { InvalidTokenError, TokenExpiredError } from 'src/domain/exceptions/auth.exceptions';
import { ForbiddenError } from 'src/domain/exceptions/forbidden.exception';
import { UserNotFoundFailure } from 'src/domain/failures/user.failures';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let tokenGateway: jest.Mocked<ITokenGateway>;
  let userRepository: jest.Mocked<IUserRepository>;
  let roleRepository: jest.Mocked<IRoleRepository>;

  const mockPayload = new JwtPayload(
    'user-1',
    'alice@example.com',
    [],
    new Date(),
    new Date(Date.now() + 3600000),
  );

  const adminRole = new Role('role-1', 'admin', [
    Permission.MANAGE_USERS,
    Permission.MANAGE_ROLES,
    Permission.MANAGE_BOOKS,
    Permission.MANAGE_BOOKSHELVES,
  ]);

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
        {
          provide: 'UserRepository',
          useValue: {
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: 'RoleRepository',
          useValue: {
            findByName: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    tokenGateway = module.get('TokenGateway');
    userRepository = module.get('UserRepository');
    roleRepository = module.get('RoleRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true for an existing user', async () => {
    const existingUser = new User('user-1', 'alice', 'alice@example.com', false, adminRole);
    tokenGateway.verifyAccessToken.mockResolvedValue(mockPayload);
    userRepository.findById.mockResolvedValue(Result.success(existingUser));

    const context = createMockContext('valid-token');
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(userRepository.count).not.toHaveBeenCalled();
    expect(roleRepository.findByName).not.toHaveBeenCalled();

    const request = context.switchToHttp().getRequest();
    expect(request['user'].role).toEqual(adminRole);
  });

  it('should assign admin role to the first user created', async () => {
    const newUser = new User('user-1', 'alice@example.com', 'alice@example.com', false);
    const userWithRole = new User('user-1', 'alice@example.com', 'alice@example.com', false, adminRole);

    tokenGateway.verifyAccessToken.mockResolvedValue(mockPayload);
    userRepository.findById.mockResolvedValue(Result.failure(new UserNotFoundFailure()));
    userRepository.create.mockResolvedValue(Result.success(newUser));
    userRepository.count.mockResolvedValue(1);
    roleRepository.findByName.mockResolvedValue(Result.success(adminRole));
    userRepository.update.mockResolvedValue(Result.success(userWithRole));

    const context = createMockContext('valid-token');
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(userRepository.count).toHaveBeenCalled();
    expect(roleRepository.findByName).toHaveBeenCalledWith('admin');
    expect(userRepository.update).toHaveBeenCalledWith('user-1', expect.objectContaining({ role: adminRole }));

    const request = context.switchToHttp().getRequest();
    expect(request['user'].role).toEqual(adminRole);
  });

  it('should not assign admin role to subsequent new users', async () => {
    const newUser = new User('user-2', 'bob@example.com', 'bob@example.com', false);

    tokenGateway.verifyAccessToken.mockResolvedValue(
      new JwtPayload('user-2', 'bob@example.com', [], new Date(), new Date(Date.now() + 3600000)),
    );
    userRepository.findById.mockResolvedValue(Result.failure(new UserNotFoundFailure()));
    userRepository.create.mockResolvedValue(Result.success(newUser));
    userRepository.count.mockResolvedValue(2);

    const context = createMockContext('valid-token');
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(userRepository.count).toHaveBeenCalled();
    expect(roleRepository.findByName).not.toHaveBeenCalled();
    expect(userRepository.update).not.toHaveBeenCalled();

    const request = context.switchToHttp().getRequest();
    expect(request['user'].role).toBeUndefined();
  });

  it('should throw ForbiddenError for a restricted user', async () => {
    const restrictedUser = new User('user-1', 'alice', 'alice@example.com', true);
    tokenGateway.verifyAccessToken.mockResolvedValue(mockPayload);
    userRepository.findById.mockResolvedValue(Result.success(restrictedUser));

    const context = createMockContext('valid-token');
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenError);
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
