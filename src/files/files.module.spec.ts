import { Test, TestingModule } from '@nestjs/testing';
import { FilesModule } from './files.module';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

describe('FilesModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [FilesModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should contain FilesController and FileService', () => {
    const controller = module.get<FilesController>(FilesController);
    const service = module.get<FilesService>(FilesService);

    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
