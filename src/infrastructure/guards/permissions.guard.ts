import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from 'src/domain/value-objects/permission.enum';
import { PERMISSIONS_KEY } from './require-permissions.decorator';
import { ForbiddenError } from 'src/domain/exceptions/forbidden.exception';
import { Role } from 'src/domain/entities/role.entity';

interface RequestUser {
  id: string;
  username: string;
  email: string;
  isRestricted: boolean;
  role?: Role;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    const user = request.user;

    if (!user?.role?.permissions) {
      throw new ForbiddenError('Insufficient permissions');
    }

    const hasPermission = requiredPermissions.every((permission) =>
      user.role!.permissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenError('Insufficient permissions');
    }

    return true;
  }
}
