import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from 'src/infrastructure/database/role.entity';
import { TypeOrmRoleRepository } from 'src/infrastructure/repositories/role.repository';
import { RoleMapper } from 'src/infrastructure/mappers/role.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity])],
  providers: [
    {
      provide: 'RoleRepository',
      useClass: TypeOrmRoleRepository,
    },
    RoleMapper,
  ],
  exports: ['RoleRepository'],
})
export class RolesModule {}
