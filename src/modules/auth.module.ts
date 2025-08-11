import { Module } from '@nestjs/common';
import { JwtTokenGateway } from '../infrastructure/gateways/jwt_token.gateway';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [
    {
      provide: 'TokenGateway',
      useClass: JwtTokenGateway,
    },

    JwtService,
  ],
  exports: ['TokenGateway'],
})
export class AuthModule {}
