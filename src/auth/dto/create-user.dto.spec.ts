import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  it('should be defined', () => {
    expect(new CreateUserDto()).toBeDefined();
  });

  it('should have the correct properties', async () => {
    const dto = new CreateUserDto();

    dto.email = 'test@example.com';
    dto.password = 'Test123';
    dto.fullName = 'Test User';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto).toHaveProperty('email');
    expect(dto).toHaveProperty('password');
    expect(dto).toHaveProperty('fullName');
  });

  it('should throw error if password is invalid', async () => {
    const dto = new CreateUserDto();

    dto.email = 'test@example.com';
    dto.fullName = 'Test User';
    dto.password = '123';

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toEqual({
      matches:
        'The password must have a Uppercase, lowercase letter and a number',
      minLength: 'password must be longer than or equal to 6 characters',
    });
  });
});
