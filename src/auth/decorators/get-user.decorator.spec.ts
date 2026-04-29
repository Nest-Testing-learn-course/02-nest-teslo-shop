import { ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { getUser } from './get-user.decorator';

jest.mock('@nestjs/common', () => ({
  createParamDecorator: jest.fn(),
  InternalServerErrorException:
    jest.requireActual('@nestjs/common').InternalServerErrorException,
}));

describe('GetUser Decorator', () => {
  const user = { id: 1, name: 'John Doe' };
  const mockExecutionContext = {
    ...jest.requireActual('@nestjs/common').ExecutionContext,
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({ user }),
    }),
  } as ExecutionContext;

  it('should return the user from the request', () => {
    const result = getUser('', mockExecutionContext);
    expect(result).toEqual(user);
  });

  it('should return the user from the request with a custom property', () => {
    const result = getUser('name', mockExecutionContext);
    expect(result).toEqual(user.name);
  });

  it('should throw an error if user is not found', () => {
    const mockExecutionContext = {
      ...jest.requireActual('@nestjs/common').ExecutionContext,
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({}),
      }),
    } as ExecutionContext;

    try {
      getUser(null, mockExecutionContext);
      expect(true).toBeFalsy();
    } catch (error) {
      expect(error).toBeInstanceOf(InternalServerErrorException);
      expect(error.message).toBe('User not found (request)');
    }
  });
});
