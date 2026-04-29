import { plainToClass } from 'class-transformer';
import { PaginationDto } from './pagination.dto';
import { validate } from 'class-validator';

describe('PaginationDto', () => {
  it('should be defined', () => {
    expect(new PaginationDto()).toBeDefined();
  });

  it('should work with different parameters', async () => {
    const dto = plainToClass(PaginationDto, {});

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should validate limit as a positive number', async () => {
    const dto = plainToClass(PaginationDto, { limit: -1 });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('limit');
    expect(errors[0].constraints).toEqual({
      isPositive: 'limit must be a positive number',
    });
  });

  it('should validate offset as a non-negative number', async () => {
    const dto = plainToClass(PaginationDto, { offset: -1 });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('offset');
    expect(errors[0].constraints).toEqual({
      min: 'offset must not be less than 0',
    });
  });

  it('should allow optional gender with valid values', async () => {
    const validValues = ['men', 'women', 'unisex', 'kid'];

    for (const value of validValues) {
      const dto = plainToClass(PaginationDto, { gender: value });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    }
  });

  it('should reject invalid gender values', async () => {
    const invalidValues = ['male', 'female', 'other', 'unknown'];

    for (const value of invalidValues) {
      const dto = plainToClass(PaginationDto, { gender: value });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('gender');
      expect(errors[0].constraints).toEqual({
        isIn: 'gender must be one of the following values: men, women, unisex, kid',
      });
    }
  });
});
