import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/infrastructure/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/guards/permissions.guard';
import { RequirePermissions } from 'src/infrastructure/guards/require-permissions.decorator';
import { Permission } from 'src/domain/value-objects/permission.enum';
import { MapResultInterceptor } from '../interceptors/map_result.interceptor';
import { PaginatedQuery } from 'src/core/paginated-query';
import { GetUsersUseCase } from 'src/application/usecases/user/get-users.usecase';
import { GetUserByIdUseCase } from 'src/application/usecases/user/get-user-by-id.usecase';
import { RestrictUserUseCase } from 'src/application/usecases/user/restrict-user.usecase';
import { UnrestrictUserUseCase } from 'src/application/usecases/user/unrestrict-user.usecase';
import { AssignRoleUseCase } from 'src/application/usecases/user/assign-role.usecase';
import { AssignRoleDto } from '../dtos/assign-role.dto';

@Controller('users')
@UseInterceptors(MapResultInterceptor)
export class UserController {
  constructor(
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly restrictUserUseCase: RestrictUserUseCase,
    private readonly unrestrictUserUseCase: UnrestrictUserUseCase,
    private readonly assignRoleUseCase: AssignRoleUseCase,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.MANAGE_USERS)
  getUsers(@Query() paginationDto: PaginatedQuery) {
    return this.getUsersUseCase.execute(paginationDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.MANAGE_USERS)
  getUserById(@Param('id') id: string) {
    return this.getUserByIdUseCase.execute({ id });
  }

  @Patch(':id/restrict')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.MANAGE_USERS)
  restrictUser(@Param('id') id: string) {
    return this.restrictUserUseCase.execute({ id });
  }

  @Patch(':id/unrestrict')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.MANAGE_USERS)
  unrestrictUser(@Param('id') id: string) {
    return this.unrestrictUserUseCase.execute({ id });
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.MANAGE_USERS)
  assignRole(@Param('id') id: string, @Body() assignRoleDto: AssignRoleDto) {
    return this.assignRoleUseCase.execute({
      userId: id,
      roleId: assignRoleDto.roleId,
    });
  }
}
