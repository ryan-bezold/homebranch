import { Module } from '@nestjs/common';
import { JwtTokenGateway } from 'src/infrastructure/gateways/jwt_token.gateway';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/infrastructure/guards/roles.guard';

@Module({
  providers: [
    {
      provide: 'TokenGateway',
      useClass: JwtTokenGateway,
    },

    JwtService,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: ['TokenGateway', JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
