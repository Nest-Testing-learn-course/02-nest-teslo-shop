import { Test } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { BadRequestException } from '@nestjs/common';

describe('FilesController', () => {
  let controller: FilesController;
  let mockFileService = {
    getStaticProductImage: jest.fn(),
  } as FilesService;
  let mockConfigModule = {
    get: jest.fn().mockReturnValue('http://localhost:3000'),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: FilesService,
          useValue: mockFileService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigModule,
        },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    mockFileService = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return file path when calling findProductImage', () => {
    const mockResponse = {
      sendFile: jest.fn(),
    } as unknown as Response;

    const imageName = 'test-image.jpg';
    const filePath = `/static/products/${imageName}`;

    // Set up spy BEFORE calling the controller method
    jest
      .spyOn(mockFileService, 'getStaticProductImage')
      .mockReturnValue(filePath);

    controller.findProductImage(mockResponse, imageName);

    expect(mockFileService.getStaticProductImage).toHaveBeenCalledWith(
      imageName,
    );
    expect(mockResponse.sendFile).toHaveBeenCalledWith(filePath);
  });

  it('should return a secureUrl when calling uploadProductImage', () => {
    const file = {
      file: 'test-image.jpg',
      filename: 'testImage.jpg',
    } as unknown as Express.Multer.File;
    const expectedUrl = 'http://localhost:3000/files/product/testImage.jpg';

    const result = controller.uploadProductImage(file);

    expect(result).toEqual({
      secureUrl: expectedUrl,
      fileName: 'testImage.jpg',
    });
  });

  it('should throw a BadRequestException if no file is provided', () => {
    const file = null as unknown as Express.Multer.File;

    expect(() => controller.uploadProductImage(file)).toThrow(
      new BadRequestException('Make sure that the file is an image'),
    );
  });
});
