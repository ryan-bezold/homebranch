/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { IUserRepository } from '../../interfaces/user-repository';
import { Result } from 'src/core/result';
import { User } from 'src/domain/entities/user.entity';
import { GetUsersUseCase } from './get-users.usecase';

describe('GetUsersUseCase', () => {
  let useCase: GetUsersUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const mockUserRepository = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUsersUseCase,
        {
          provide: 'UserRepository',
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetUsersUseCase>(GetUsersUseCase);
    userRepository = module.get('UserRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return a paginated list of users', async () => {
      const mockUsers: User[] = [
        new User('user-1', 'alice', 'alice@example.com', false),
        new User('user-2', 'bob', 'bob@example.com', true),
      ];

      userRepository.findAll.mockResolvedValue(
        Result.success({
          data: mockUsers,
          limit: 10,
          offset: 0,
          total: 2,
          nextCursor: null,
        }),
      );

      const result = await useCase.execute({ limit: 10, offset: 0 });

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().data).toHaveLength(2);
      expect(userRepository.findAll).toHaveBeenCalledWith(10, 0);
    });
  });
});
