/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { IRoleRepository } from 'src/application/interfaces/role-repository';
import { Result } from 'src/core/result';
import { Role } from 'src/domain/entities/role.entity';
import { Permission } from 'src/domain/value-objects/permission.enum';
import { CreateRoleUseCase } from 'src/application/usecases/role/create-role.usecase';
import {
  DuplicateRoleNameFailure,
  RoleNotFoundFailure,
} from 'src/domain/failures/role.failures';

describe('CreateRoleUseCase', () => {
  let useCase: CreateRoleUseCase;
  let roleRepository: jest.Mocked<IRoleRepository>;

  beforeEach(async () => {
    const mockRoleRepository = {
      findByName: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRoleUseCase,
        {
          provide: 'RoleRepository',
          useValue: mockRoleRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateRoleUseCase>(CreateRoleUseCase);
    roleRepository = module.get('RoleRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should create a role', async () => {
      const createdRole = new Role(expect.any(String), 'editor', [
        Permission.MANAGE_BOOKS,
      ]);

      roleRepository.findByName.mockResolvedValue(
        Result.failure(new RoleNotFoundFailure()),
      );
      roleRepository.create.mockResolvedValue(Result.success(createdRole));

      const result = await useCase.execute({
        name: 'editor',
        permissions: [Permission.MANAGE_BOOKS],
      });

      expect(result.isSuccess()).toBe(true);
      expect(roleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'editor',
          permissions: [Permission.MANAGE_BOOKS],
        }),
      );
    });

    it('should return failure when role name already exists', async () => {
      const existingRole = new Role('role-1', 'editor', [
        Permission.MANAGE_BOOKS,
      ]);

      roleRepository.findByName.mockResolvedValue(Result.success(existingRole));

      const result = await useCase.execute({
        name: 'editor',
        permissions: [Permission.MANAGE_BOOKS],
      });

      expect(result.isFailure()).toBe(true);
      expect(result.getFailure()).toBeInstanceOf(DuplicateRoleNameFailure);
      expect(roleRepository.create).not.toHaveBeenCalled();
    });
  });
});
