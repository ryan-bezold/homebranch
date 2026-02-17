/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { IUserRepository } from '../../interfaces/user-repository';
import { IRoleRepository } from '../../interfaces/role-repository';
import { Result } from 'src/core/result';
import { User } from 'src/domain/entities/user.entity';
import { Role } from 'src/domain/entities/role.entity';
import { Permission } from 'src/domain/value-objects/permission.enum';
import { AssignRoleUseCase } from './assign-role.usecase';
import { UserNotFoundFailure } from 'src/domain/failures/user.failures';
import { RoleNotFoundFailure } from 'src/domain/failures/role.failures';

describe('AssignRoleUseCase', () => {
  let useCase: AssignRoleUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let roleRepository: jest.Mocked<IRoleRepository>;

  beforeEach(async () => {
    const mockUserRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const mockRoleRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignRoleUseCase,
        {
          provide: 'UserRepository',
          useValue: mockUserRepository,
        },
        {
          provide: 'RoleRepository',
          useValue: mockRoleRepository,
        },
      ],
    }).compile();

    useCase = module.get<AssignRoleUseCase>(AssignRoleUseCase);
    userRepository = module.get('UserRepository');
    roleRepository = module.get('RoleRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const mockRole = new Role('role-1', 'admin', [Permission.MANAGE_USERS]);
    const mockUser = new User('user-1', 'alice', 'alice@example.com', false);

    it('should assign a role to a user', async () => {
      const updatedUser = new User('user-1', 'alice', 'alice@example.com', false, mockRole);

      userRepository.findById.mockResolvedValue(Result.success(mockUser));
      roleRepository.findById.mockResolvedValue(Result.success(mockRole));
      userRepository.update.mockResolvedValue(Result.success(updatedUser));

      const result = await useCase.execute({
        userId: 'user-1',
        roleId: 'role-1',
      });

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().role).toEqual(mockRole);
    });

    it('should return failure when user is not found', async () => {
      userRepository.findById.mockResolvedValue(
        Result.failure(new UserNotFoundFailure()),
      );

      const result = await useCase.execute({
        userId: 'nonexistent',
        roleId: 'role-1',
      });

      expect(result.isFailure()).toBe(true);
      expect(result.getFailure()).toBeInstanceOf(UserNotFoundFailure);
    });

    it('should return failure when role is not found', async () => {
      userRepository.findById.mockResolvedValue(Result.success(mockUser));
      roleRepository.findById.mockResolvedValue(
        Result.failure(new RoleNotFoundFailure()),
      );

      const result = await useCase.execute({
        userId: 'user-1',
        roleId: 'nonexistent',
      });

      expect(result.isFailure()).toBe(true);
      expect(result.getFailure()).toBeInstanceOf(RoleNotFoundFailure);
    });
  });
});
