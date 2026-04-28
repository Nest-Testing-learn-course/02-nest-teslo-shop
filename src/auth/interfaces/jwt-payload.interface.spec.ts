import { JwtPayload } from './jwt-payload.interface';

describe('JwtPayloadInterface', () => {
  it('should true for a valid payload', () => {
    const validPayload: JwtPayload = {
      id: '123',
    };
    expect(validPayload).toHaveProperty('id');
    expect(validPayload.id).toBe('123');
  });
});
