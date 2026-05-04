import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities';
import { DataSource, Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { CreateProductDto } from './dto/create-product.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: Repository<Product>;
  let productImageRepository: Repository<ProductImage>;

  beforeEach(async () => {
    const mockProductRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      findOneBy: jest.fn(),
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      preload: jest.fn(),
      remove: jest.fn(),
    };

    const mockProductImageRepository = {
      create: jest.fn(),
    };

    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          delete: jest.fn(),
          save: jest.fn(),
        },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(ProductImage),
          useValue: mockProductImageRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    productImageRepository = module.get<Repository<ProductImage>>(
      getRepositoryToken(ProductImage),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a product', async () => {
    const dto = {
      title: 'Test Product',
      images: ['image1.jpg'],
      price: 100,
    } as CreateProductDto;

    const user = {
      id: '1',
      email: 'test@example.com',
    } as User;

    const product = { id: '1', ...dto } as unknown as Product;

    jest.spyOn(productRepository, 'create').mockReturnValue(product);
    jest.spyOn(productRepository, 'save').mockResolvedValue(product);
    jest
      .spyOn(productImageRepository, 'create')
      .mockImplementation((imageData) => imageData as ProductImage);

    const result = await service.create(dto, user);
    expect(result).toEqual({
      id: '1',
      title: 'Test Product',
      images: ['image1.jpg'],
      price: 100,
    });
  });
});
