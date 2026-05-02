import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcryptjs';
import { Test } from '@nestjs/testing';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { CreateUserDto, LoginUserDto } from './dto';
import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const mockUserRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    userRepository = moduleRef.get<Repository<User>>(getRepositoryToken(User));
    jwtService = moduleRef.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should create a user and return user with token', async () => {
    const dto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
    };

    const user = {
      email: dto.email,
      fullName: dto.fullName,
      id: '1',
      isActive: true,
    } as User;

    jest.spyOn(userRepository, 'create').mockReturnValue(user);
    jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hashed-password');

    const result = await authService.create(dto);

    expect(bcrypt.hashSync).toHaveBeenCalledWith(dto.password, 10);
    expect(result).toEqual({
      user: {
        id: '1',
        email: dto.email,
        fullName: dto.fullName,
        isActive: true,
      },
      token: 'mock-jwt-token',
    });
  });

  it('should throw error if email already exists', async () => {
    const dto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
    };

    jest.spyOn(userRepository, 'save').mockRejectedValue({
      code: '23505',
      detail: 'email already exists',
    });

    await expect(authService.create(dto)).rejects.toThrow(BadRequestException);
    await expect(authService.create(dto)).rejects.toThrow(
      'email already exists',
    );
  });

  it('should throw and internal server error', async () => {
    const dto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
    };

    const error = {
      code: '1',
      detail: 'internal server error',
    };

    jest.spyOn(userRepository, 'save').mockRejectedValue(error);

    const logSpy = jest.spyOn(console, 'log').mockImplementation();

    await expect(authService.create(dto)).rejects.toThrow(
      InternalServerErrorException,
    );
    await expect(authService.create(dto)).rejects.toThrow(
      'Please check server logs',
    );
    expect(console.log).toHaveBeenCalledWith(error);
    expect(console.log).toHaveBeenCalledTimes(2);
    logSpy.mockRestore();
  });

  it('should login a user and return user with token', async () => {
    const dto: LoginUserDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const user = {
      email: dto.email,
      password: 'hashed-password',
      id: '1',
      fullName: 'Test User',
      isActive: true,
      roles: ['user'],
    } as User;

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
    jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

    const result = await authService.login(dto);

    expect(bcrypt.compareSync).toHaveBeenCalledWith(
      dto.password,
      'hashed-password',
    );
    expect(result).toEqual({
      user: {
        id: '1',
        email: dto.email,
        fullName: 'Test User',
        isActive: true,
        roles: ['user'],
      },
      token: 'mock-jwt-token',
    });
    expect(result.user.password).toBeUndefined();
  });

  it('should throw UnauthorizedException error if user not found', async () => {
    const dto: LoginUserDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

    await expect(authService.login(dto)).rejects.toThrow(UnauthorizedException);
    await expect(authService.login(dto)).rejects.toThrow(
      'Credentials are not valid (email)',
    );
  });

  it('should throw UnauthorizedException error if password is incorrect', async () => {
    const dto: LoginUserDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const user = { password: 'hashed-password' } as User;

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
    jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

    await expect(authService.login(dto)).rejects.toThrow(UnauthorizedException);
    await expect(authService.login(dto)).rejects.toThrow(
      'Credentials are not valid (password)',
    );
  });

  it('should check auth status and return user with new token', async () => {
    const user = { id: '1' } as User;

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
    jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

    const result = await authService.checkAuthStatus(user);

    expect(result).toEqual({ user, token: 'mock-jwt-token' });
  });
});
