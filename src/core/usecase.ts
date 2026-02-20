import { Result } from './result';

export interface UseCase<Input, Output> {
  execute(input: Input): Promise<Result<Output>>;
}
