import { META_ROLES, RoleProtected } from './role-protected.decorator';
import { ValidRoles } from '../interfaces';
import { SetMetadata } from '@nestjs/common';

jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn().mockImplementation((key, value) => {
    return { key, value };
  }),
}));

describe('RoleProtected Decorator', () => {
  it('should set metadata with correct roles', () => {
    const roles: ValidRoles[] = [ValidRoles.admin, ValidRoles.user];
    const result = RoleProtected(...roles);

    expect(result).toEqual({ key: META_ROLES, value: roles });
    expect(SetMetadata).toHaveBeenCalled();
    expect(SetMetadata).toHaveBeenCalledWith(META_ROLES, roles);
  });
});
