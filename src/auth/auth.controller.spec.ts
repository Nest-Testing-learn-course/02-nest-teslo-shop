import { Test } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const authServiceMock = {
    login: jest.fn(),
    create: jest.fn(),
    checkAuthStatus: jest.fn(),
  };
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('should call authService.create when createUser is called', async () => {
    const dto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password',
      fullName: 'Test User',
    };

    await authController.createUser(dto);

    expect(authService.create).toHaveBeenCalledWith(dto);
  });

  it('should call authService.login when loginUser is called', async () => {
    const dto: LoginUserDto = {
      email: 'test@example.com',
      password: 'password',
    };

    await authController.loginUser(dto);

    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('should call authService.checkAuthStatus when checkAuthStatus is called', async () => {
    const user = {
      email: 'test@example.com',
      password: 'password',
      fullName: 'Test User',
    } as User;

    await authController.checkAuthStatus(user);

    expect(authService.checkAuthStatus).toHaveBeenCalledWith(user);
  });

  it('should return private route data', () => {
    const user = {
      id: '1',
      email: 'test@example.com',
      password: 'password',
      fullName: 'Test User',
    } as User;

    const request = {} as Express.Request;
    const rawHeaders = { authorization: 'Bearer token', 'user-agent': 'test' };
    const headers = { authorization: 'Bearer token', 'user-agent': 'test' };
    const result = authController.testingPrivateRoute(
      request,
      user,
      user.email,
      Object.keys(rawHeaders),
      headers,
    );

    expect(result).toEqual({
      ok: true,
      message: 'Hola Mundo Private',
      user,
      userEmail: user.email,
      rawHeaders: Object.keys(rawHeaders),
      headers,
    });
  });
});
