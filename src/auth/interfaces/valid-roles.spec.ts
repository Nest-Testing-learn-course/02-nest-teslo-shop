import { ValidRoles } from './valid-roles';

describe('ValidRoles', () => {
  it('should have correct values', () => {
    const keysToHave = ['admin', 'super-user', 'user'];
    expect(Object.values(ValidRoles)).toEqual(
      expect.arrayContaining(keysToHave),
    );
  });
});
