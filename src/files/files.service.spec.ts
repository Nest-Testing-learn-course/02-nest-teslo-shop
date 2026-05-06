import { Test } from '@nestjs/testing';
import { FilesService } from './files.service';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { BadRequestException } from '@nestjs/common';

jest.mock('node:fs', () => ({
  existsSync: jest.fn(),
}));

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [FilesService],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a path when calling getStaticProductImage', () => {
    const imageName = 'test.jpg';
    const expectedPath = join(__dirname, '../../static/products', imageName);

    (existsSync as jest.Mock).mockReturnValue(true);

    const result = service.getStaticProductImage(imageName);
    expect(result).toBe(expectedPath);
  });

  it('should throw an error when calling getStaticProductImage with non-existent file', () => {
    const imageName = 'test.jpg';

    (existsSync as jest.Mock).mockReturnValue(false);

    expect(() => service.getStaticProductImage(imageName)).toThrow(
      new BadRequestException(`No product found with image ${imageName}`),
    );
  });
});
