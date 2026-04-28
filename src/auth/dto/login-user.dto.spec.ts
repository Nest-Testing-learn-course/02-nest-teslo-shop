import { validate } from 'class-validator';
import { LoginUserDto } from './login-user.dto';
import { plainToClass } from 'class-transformer';

describe('LoginUserDto', () => {
  it('should be defined', () => {
    expect(new LoginUserDto()).toBeDefined();
  });

  it('should have the correct properties', async () => {
    const dto = plainToClass(LoginUserDto, {
      email: 'test@example.com',
      password: 'Test123',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto).toHaveProperty('email');
    expect(dto).toHaveProperty('password');
  });

  it('should throw error if password is invalid', async () => {
    const dto = plainToClass(LoginUserDto, {
      email: 'test@example.com',
      password: '123',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toEqual({
      matches:
        'The password must have a Uppercase, lowercase letter and a number',
      minLength: 'password must be longer than or equal to 6 characters',
    });
  });
});
