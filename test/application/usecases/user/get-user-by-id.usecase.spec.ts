/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { IUserRepository } from 'src/application/interfaces/user-repository';
import { Result } from 'src/core/result';
import { User } from 'src/domain/entities/user.entity';
import { GetUserByIdUseCase } from 'src/application/usecases/user/get-user-by-id.usecase';
import { UserNotFoundFailure } from 'src/domain/failures/user.failures';

describe('GetUserByIdUseCase', () => {
  let useCase: GetUserByIdUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const mockUserRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserByIdUseCase,
        {
          provide: 'UserRepository',
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetUserByIdUseCase>(GetUserByIdUseCase);
    userRepository = module.get('UserRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return a user when found', async () => {
      const mockUser = new User('user-1', 'alice', 'alice@example.com', false);

      userRepository.findById.mockResolvedValue(Result.success(mockUser));

      const result = await useCase.execute({ id: 'user-1' });

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith('user-1');
    });

    it('should return failure when user is not found', async () => {
      userRepository.findById.mockResolvedValue(
        Result.failure(new UserNotFoundFailure()),
      );

      const result = await useCase.execute({ id: 'nonexistent' });

      expect(result.isFailure()).toBe(true);
      expect(result.getFailure()).toBeInstanceOf(UserNotFoundFailure);
    });
  });
});
