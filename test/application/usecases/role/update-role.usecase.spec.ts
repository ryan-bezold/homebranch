/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { IRoleRepository } from 'src/application/interfaces/role-repository';
import { Result } from 'src/core/result';
import { Role } from 'src/domain/entities/role.entity';
import { Permission } from 'src/domain/value-objects/permission.enum';
import { UpdateRoleUseCase } from 'src/application/usecases/role/update-role.usecase';
import { RoleNotFoundFailure } from 'src/domain/failures/role.failures';

describe('UpdateRoleUseCase', () => {
  let useCase: UpdateRoleUseCase;
  let roleRepository: jest.Mocked<IRoleRepository>;

  beforeEach(async () => {
    const mockRoleRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateRoleUseCase,
        {
          provide: 'RoleRepository',
          useValue: mockRoleRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateRoleUseCase>(UpdateRoleUseCase);
    roleRepository = module.get('RoleRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should update a role permissions', async () => {
      const existingRole = new Role('role-1', 'editor', [
        Permission.MANAGE_BOOKS,
      ]);
      const updatedRole = new Role('role-1', 'editor', [
        Permission.MANAGE_BOOKS,
        Permission.MANAGE_BOOKSHELVES,
      ]);

      roleRepository.findById.mockResolvedValue(Result.success(existingRole));
      roleRepository.update.mockResolvedValue(Result.success(updatedRole));

      const result = await useCase.execute({
        id: 'role-1',
        permissions: [Permission.MANAGE_BOOKS, Permission.MANAGE_BOOKSHELVES],
      });

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().permissions).toContain(
        Permission.MANAGE_BOOKSHELVES,
      );
    });

    it('should return failure when role is not found', async () => {
      roleRepository.findById.mockResolvedValue(
        Result.failure(new RoleNotFoundFailure()),
      );

      const result = await useCase.execute({
        id: 'nonexistent',
        permissions: [Permission.MANAGE_BOOKS],
      });

      expect(result.isFailure()).toBe(true);
      expect(result.getFailure()).toBeInstanceOf(RoleNotFoundFailure);
    });
  });
});
