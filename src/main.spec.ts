// import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { bootstrap } from './main';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

jest.mock('@nestjs/common', () => ({
  Logger: jest.fn().mockReturnValue({ log: jest.fn() }),
  ValidationPipe: jest.requireActual('@nestjs/common').ValidationPipe,
}));

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn().mockResolvedValue({
      setGlobalPrefix: jest.fn(),
      enableCors: jest.fn(),
      useGlobalPipes: jest.fn(),
      listen: jest.fn(),
    }),
  },
}));

jest.mock('@nestjs/swagger', () => ({
  DocumentBuilder: jest.fn().mockReturnValue({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    build: jest.fn(),
  }),
  ApiProperty: jest.fn(),
  SwaggerModule: {
    createDocument: jest.fn().mockReturnValue('document'),
    setup: jest.fn(),
  },
}));

jest.mock('./app.module', () => ({
  AppModule: jest.fn().mockReturnValue('AppModule'),
}));

describe('Main', () => {
  let mockApp: {
    setGlobalPrefix: jest.Mock;
    enableCors: jest.Mock;
    useGlobalPipes: jest.Mock;
    listen: jest.Mock;
  };

  let mockLogger: {
    log: jest.Mock;
  };

  beforeEach(async () => {
    mockApp = {
      setGlobalPrefix: jest.fn(),
      enableCors: jest.fn(),
      useGlobalPipes: jest.fn(),
      listen: jest.fn(),
    };

    mockLogger = {
      log: jest.fn(),
    };
    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);
    (Logger as unknown as jest.Mock).mockReturnValue(mockLogger);
  });

  it('should bootstrap the application with appModule', async () => {
    await bootstrap();

    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
    expect(mockLogger.log).toHaveBeenCalledWith('App running on port 3000');
  });

  it('should bootstrap the application with appModule and custom port', async () => {
    process.env.PORT = '30012';

    await bootstrap();

    expect(mockApp.listen).toHaveBeenCalledWith('30012');
  });

  it('should bootstrap the application and set global prefix', async () => {
    await bootstrap();

    expect(mockApp.setGlobalPrefix).toHaveBeenCalledWith('api');
  });

  it('should bootstrap the application and use global pipes', async () => {
    await bootstrap();

    expect(mockApp.useGlobalPipes).toHaveBeenCalledWith(
      expect.any(ValidationPipe),
    );
  });

  it('should bootstrap the application and enable cors', async () => {
    await bootstrap();

    expect(mockApp.enableCors).toHaveBeenCalled();
  });

  it('should call DocumentBuilder', async () => {
    await bootstrap();

    expect(DocumentBuilder).toHaveBeenCalled();
  });

  it('should create swagger document', async () => {
    await bootstrap();

    expect(SwaggerModule.createDocument).toHaveBeenCalled();
    expect(SwaggerModule.setup).toHaveBeenCalledWith(
      'api',
      expect.anything(),
      'document',
    );
  });
});
