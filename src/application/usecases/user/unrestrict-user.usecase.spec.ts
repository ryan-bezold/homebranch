/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { IUserRepository } from '../../interfaces/user-repository';
import { Result } from 'src/core/result';
import { User } from 'src/domain/entities/user.entity';
import { UnrestrictUserUseCase } from './unrestrict-user.usecase';
import { UserNotFoundFailure } from 'src/domain/failures/user.failures';

describe('UnrestrictUserUseCase', () => {
  let useCase: UnrestrictUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const mockUserRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnrestrictUserUseCase,
        {
          provide: 'UserRepository',
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<UnrestrictUserUseCase>(UnrestrictUserUseCase);
    userRepository = module.get('UserRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should unrestrict a user', async () => {
      const mockUser = new User('user-1', 'alice', 'alice@example.com', true);
      const unrestrictedUser = new User('user-1', 'alice', 'alice@example.com', false);

      userRepository.findById.mockResolvedValue(Result.success(mockUser));
      userRepository.update.mockResolvedValue(Result.success(unrestrictedUser));

      const result = await useCase.execute({ id: 'user-1' });

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().isRestricted).toBe(false);
      expect(userRepository.update).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ isRestricted: false }),
      );
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
