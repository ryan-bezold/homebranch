import { SetMetadata } from '@nestjs/common';
import { Permission } from 'src/domain/value-objects/permission.enum';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
