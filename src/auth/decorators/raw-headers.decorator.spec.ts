import { getRawHeaders } from './raw-headers.decorator';
import { ExecutionContext } from '@nestjs/common';

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  createParamDecorator: jest.fn().mockImplementation(() => jest.fn()),
}));

describe('RawHeaders Decorator', () => {
  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({
        rawHeaders: ['Authorization', 'Bearer token', 'User-Agent', 'NestJs'],
      }),
    }),
    getClass: jest.fn(),
    getHandler: jest.fn(),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    getType: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
  } as ExecutionContext;

  it('should return raw headers from the request', () => {
    const result = getRawHeaders('', mockExecutionContext);
    expect(result).toEqual([
      'Authorization',
      'Bearer token',
      'User-Agent',
      'NestJs',
    ]);
  });

  it('should call createParamDecorator with getRawHeaders', () => {
    getRawHeaders('', mockExecutionContext);
    expect(
      jest.requireMock('@nestjs/common').createParamDecorator,
    ).toHaveBeenCalledWith(getRawHeaders);
  });
});
