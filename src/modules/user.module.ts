import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth.module';
import { RolesModule } from './role.module';
import { UserEntity } from 'src/infrastructure/database/user.entity';
import { RoleEntity } from 'src/infrastructure/database/role.entity';
import { TypeOrmUserRepository } from 'src/infrastructure/repositories/user.repository';
import { GetUsersUseCase } from 'src/application/usecases/user/get-users.usecase';
import { GetUserByIdUseCase } from 'src/application/usecases/user/get-user-by-id.usecase';
import { RestrictUserUseCase } from 'src/application/usecases/user/restrict-user.usecase';
import { UnrestrictUserUseCase } from 'src/application/usecases/user/unrestrict-user.usecase';
import { AssignRoleUseCase } from 'src/application/usecases/user/assign-role.usecase';
import { GetRolesUseCase } from 'src/application/usecases/role/get-roles.usecase';
import { CreateRoleUseCase } from 'src/application/usecases/role/create-role.usecase';
import { UpdateRoleUseCase } from 'src/application/usecases/role/update-role.usecase';
import { DeleteRoleUseCase } from 'src/application/usecases/role/delete-role.usecase';
import { UserMapper } from 'src/infrastructure/mappers/user.mapper';
import { UserController } from 'src/presentation/controllers/user.controller';
import { RoleController } from 'src/presentation/controllers/role.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RoleEntity]),
    AuthModule,
    RolesModule,
  ],
  providers: [
    // Repository
    {
      provide: 'UserRepository',
      useClass: TypeOrmUserRepository,
    },

    // User Use Cases
    GetUsersUseCase,
    GetUserByIdUseCase,
    RestrictUserUseCase,
    UnrestrictUserUseCase,
    AssignRoleUseCase,

    // Role Use Cases
    GetRolesUseCase,
    CreateRoleUseCase,
    UpdateRoleUseCase,
    DeleteRoleUseCase,

    // Mappers
    UserMapper,
  ],
  controllers: [UserController, RoleController],
  exports: ['UserRepository', RolesModule],
})
export class UsersModule {}
