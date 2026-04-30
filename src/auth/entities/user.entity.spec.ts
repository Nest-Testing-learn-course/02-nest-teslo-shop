import { User } from './user.entity';

describe('User Entity', () => {
  it('should create a user entity instance', () => {
    const user = new User();
    expect(user).toBeDefined();
    expect(user).toBeInstanceOf(User);
  });

  it('should clear email before save', () => {
    const user = new User();
    user.email = '    test@EXAmple.com    ';
    user.checkFieldsBeforeInsert();
    expect(user.email).toBe('test@example.com');
  });

  it('should clear email before update', () => {
    const user = new User();
    user.email = '    test@exAmpLe.com    ';
    user.checkFieldsBeforeUpdate();
    expect(user.email).toBe('test@example.com');
  });
});
