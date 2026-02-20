export abstract class Failure {
  readonly code: string;
  readonly message: string;

  protected constructor(code: string, message: string) {
    this.code = code;
    this.message = message;
  }
}

export abstract class Result<T, E = Failure> {
  static success<T, E = Failure>(value: T): Result<T, E> {
    return new _Success(value);
  }

  static failure<T, E = Failure>(failure: E): Result<T, E> {
    return new _Failure(failure);
  }

  abstract isSuccess(): this is _Success<T, E>;

  abstract isFailure(): this is _Failure<T, E>;

  abstract getValue(): T;

  abstract getFailure(): E;
}

class _Success<T, E> extends Result<T, E> {
  constructor(private readonly value: T) {
    super();
  }

  isSuccess(): this is _Success<T, E> {
    return true;
  }

  isFailure(): this is _Failure<T, E> {
    return false;
  }

  getValue(): T {
    return this.value;
  }

  getFailure(): E {
    throw new Error('Called getFailure on Success');
  }
}

export class _Failure<T, E> extends Result<T, E> {
  constructor(private readonly error: E) {
    super();
  }

  isSuccess(): this is _Success<T, E> {
    return false;
  }

  isFailure(): this is _Failure<T, E> {
    return true;
  }

  getValue(): T {
    throw new Error('Called getValue on Failure');
  }

  getFailure(): E {
    return this.error;
  }
}
