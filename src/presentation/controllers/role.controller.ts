import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/infrastructure/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/guards/permissions.guard';
import { RequirePermissions } from 'src/infrastructure/guards/require-permissions.decorator';
import { Permission } from 'src/domain/value-objects/permission.enum';
import { MapResultInterceptor } from '../interceptors/map_result.interceptor';
import { GetRolesUseCase } from 'src/application/usecases/role/get-roles.usecase';
import { CreateRoleUseCase } from 'src/application/usecases/role/create-role.usecase';
import { UpdateRoleUseCase } from 'src/application/usecases/role/update-role.usecase';
import { DeleteRoleUseCase } from 'src/application/usecases/role/delete-role.usecase';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { UpdateRoleDto } from '../dtos/update-role.dto';

@Controller('roles')
@UseInterceptors(MapResultInterceptor)
export class RoleController {
  constructor(
    private readonly getRolesUseCase: GetRolesUseCase,
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
    private readonly deleteRoleUseCase: DeleteRoleUseCase,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.MANAGE_ROLES)
  getRoles() {
    return this.getRolesUseCase.execute();
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.MANAGE_ROLES)
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.createRoleUseCase.execute(createRoleDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.MANAGE_ROLES)
  updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.updateRoleUseCase.execute({
      id,
      permissions: updateRoleDto.permissions,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.MANAGE_ROLES)
  deleteRole(@Param('id') id: string) {
    return this.deleteRoleUseCase.execute({ id });
  }
}
