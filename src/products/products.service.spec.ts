import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities';
import { DataSource, Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: Repository<Product>;
  let productImageRepository: Repository<ProductImage>;

  beforeEach(async () => {
    const mockQueryBuilder = {
      where: jest.fn(() => mockQueryBuilder),
      leftJoinAndSelect: jest.fn(() => mockQueryBuilder),
      getOne: jest.fn().mockResolvedValue({
        id: 'valid-uuid',
        title: 'Test Product 1',
        slug: 'test-product-1',
        images: [{ id: 1, url: 'test.jpg' }],
      }),
    };

    const mockProductRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      findOneBy: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
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

  it('should throw a BadRequestException if create product fails', async () => {
    const dto = {
      title: 'Test Product',
      images: ['image1.jpg'],
      price: 100,
    } as CreateProductDto;

    const user = {
      id: '1',
      email: 'test@example.com',
    } as User;

    const error = {
      code: '23505',
      detail: 'mock error details',
    };
    jest.spyOn(productRepository, 'save').mockRejectedValue(error);

    await expect(service.create(dto, user)).rejects.toThrow(error.detail);
    await expect(service.create(dto, user)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should find all products', async () => {
    const paginationDto: PaginationDto = {
      limit: 10,
      offset: 0,
      gender: 'kid',
    };

    const products = [
      {
        id: '1',
        title: 'Test Product',
        images: [{ id: 1, url: 'image1.jpg', product: {} as Product }],
      },
      {
        id: '2',
        title: 'Test Product',
        images: [{ id: 2, url: 'image2.jpg', product: {} as Product }],
      },
    ] as Product[];

    const count = products.length;
    jest.spyOn(productRepository, 'find').mockResolvedValue(products);
    jest.spyOn(productRepository, 'count').mockResolvedValue(count);

    const result = await service.findAll(paginationDto);

    expect(result).toEqual({
      count,
      pages: 1,
      products: products.map((p) => ({
        ...p,
        images: p.images.map((img) => img.url),
      })),
    });
  });

  it('should find a product bt valid uuid', async () => {
    const productId = '123e4567-e89b-12d3-a456-426614174000';

    const product = {
      id: productId,
      title: 'Test Product',
    } as Product;

    jest.spyOn(productRepository, 'findOneBy').mockResolvedValue(product);

    const result = await service.findOne(productId);

    expect(result).toEqual(product);
  });

  it('should throw and error if id not found', async () => {
    const productId = '123e4567-e89b-12d3-a456-426614174000';

    jest.spyOn(productRepository, 'findOneBy').mockResolvedValue(null);

    await expect(service.findOne(productId)).rejects.toThrow(NotFoundException);
    await expect(service.findOne(productId)).rejects.toThrow(
      `Product with ${productId} not found`,
    );
  });

  it('should return product by slug', async () => {
    const slug = 'test-product';

    const product = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Product',
    } as Product;

    jest.spyOn(productRepository, 'findOneBy').mockResolvedValue(product);

    const result = await service.findOne(slug);

    expect(result).toEqual({
      id: 'valid-uuid',
      title: 'Test Product 1',
      slug: 'test-product-1',
      images: [{ id: 1, url: 'test.jpg' }],
    });
  });

  it('should throw NotFoundException if product not found (update)', async () => {
    const id = '1';
    const dto = {} as UpdateProductDto;
    const user = {} as User;

    jest.spyOn(productRepository, 'preload').mockResolvedValue(null);

    await expect(service.update(id, dto, user)).rejects.toThrow(
      new NotFoundException(`Product with id: ${id} not found`),
    );
  });

  it('should update a product successfully', async () => {
    const id = '1';

    const dto = {
      title: 'updates product',
      slug: 'updates-product',
    } as UpdateProductDto;

    const user = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      fullName: 'Test User',
    } as User;

    const product = {
      ...dto,
      price: 100,
      description: 'some description',
    } as unknown as Product;

    jest.spyOn(productRepository, 'preload').mockResolvedValue(product);

    const updatedProduct = await service.update(id, dto, user);

    expect(updatedProduct).toEqual({
      id: 'valid-uuid',
      title: 'Test Product 1',
      slug: 'test-product-1',
      images: ['test.jpg'],
    });
  });
});
