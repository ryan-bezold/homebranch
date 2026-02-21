/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { IRoleRepository } from 'src/application/interfaces/role-repository';
import { IUserRepository } from 'src/application/interfaces/user-repository';
import { Result } from 'src/core/result';
import { Role } from 'src/domain/entities/role.entity';
import { Permission } from 'src/domain/value-objects/permission.enum';
import { DeleteRoleUseCase } from 'src/application/usecases/role/delete-role.usecase';
import {
  RoleNotFoundFailure,
  RoleHasAssignedUsersFailure,
} from 'src/domain/failures/role.failures';

describe('DeleteRoleUseCase', () => {
  let useCase: DeleteRoleUseCase;
  let roleRepository: jest.Mocked<IRoleRepository>;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const mockRoleRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    };

    const mockUserRepository = {
      countByRoleId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteRoleUseCase,
        {
          provide: 'RoleRepository',
          useValue: mockRoleRepository,
        },
        {
          provide: 'UserRepository',
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteRoleUseCase>(DeleteRoleUseCase);
    roleRepository = module.get('RoleRepository');
    userRepository = module.get('UserRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const mockRole = new Role('role-1', 'editor', [Permission.MANAGE_BOOKS]);

    it('should delete a role with no assigned users', async () => {
      roleRepository.findById.mockResolvedValue(Result.success(mockRole));
      userRepository.countByRoleId.mockResolvedValue(0);
      roleRepository.delete.mockResolvedValue(Result.success(mockRole));

      const result = await useCase.execute({ id: 'role-1' });

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toEqual(mockRole);
      expect(roleRepository.delete).toHaveBeenCalledWith('role-1');
    });

    it('should return failure when role has assigned users', async () => {
      roleRepository.findById.mockResolvedValue(Result.success(mockRole));
      userRepository.countByRoleId.mockResolvedValue(3);

      const result = await useCase.execute({ id: 'role-1' });

      expect(result.isFailure()).toBe(true);
      expect(result.getFailure()).toBeInstanceOf(RoleHasAssignedUsersFailure);
      expect(roleRepository.delete).not.toHaveBeenCalled();
    });

    it('should return failure when role is not found', async () => {
      roleRepository.findById.mockResolvedValue(
        Result.failure(new RoleNotFoundFailure()),
      );

      const result = await useCase.execute({ id: 'nonexistent' });

      expect(result.isFailure()).toBe(true);
      expect(result.getFailure()).toBeInstanceOf(RoleNotFoundFailure);
    });
  });
});
