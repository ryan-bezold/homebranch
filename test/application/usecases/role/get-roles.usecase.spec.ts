/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { IRoleRepository } from 'src/application/interfaces/role-repository';
import { Result } from 'src/core/result';
import { Role } from 'src/domain/entities/role.entity';
import { Permission } from 'src/domain/value-objects/permission.enum';
import { GetRolesUseCase } from 'src/application/usecases/role/get-roles.usecase';

describe('GetRolesUseCase', () => {
  let useCase: GetRolesUseCase;
  let roleRepository: jest.Mocked<IRoleRepository>;

  beforeEach(async () => {
    const mockRoleRepository = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRolesUseCase,
        {
          provide: 'RoleRepository',
          useValue: mockRoleRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetRolesUseCase>(GetRolesUseCase);
    roleRepository = module.get('RoleRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return a list of roles', async () => {
      const mockRoles: Role[] = [
        new Role('role-1', 'admin', [
          Permission.MANAGE_USERS,
          Permission.MANAGE_ROLES,
        ]),
        new Role('role-2', 'user', []),
      ];

      roleRepository.findAll.mockResolvedValue(Result.success(mockRoles));

      const result = await useCase.execute();

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toHaveLength(2);
      expect(roleRepository.findAll).toHaveBeenCalled();
    });
  });
});
