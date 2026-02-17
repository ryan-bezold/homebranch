import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookEntity } from 'src/infrastructure/database/book.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { BookShelfEntity } from '../infrastructure/database/book-shelf.entity';
import { UserEntity } from '../infrastructure/database/user.entity';
import { RoleEntity } from '../infrastructure/database/role.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('TypeOrmModule');
        const isProduction =
          configService.get<string>('NODE_ENV') === 'production';

        // Validate required environment variables
        const username = configService.get<string>('DATABASE_USERNAME');
        const password = configService.get<string>('DATABASE_PASSWORD');
        const host = configService.get<string>('DATABASE_HOST', 'localhost');
        const port = configService.get<number>('DATABASE_PORT', 5432);
        const database = configService.get<string>(
          'DATABASE_NAME',
          'homebranch',
        );

        logger.log(`Connecting to ${database} at ${host}:${port}`);

        if (!username || !password) {
          throw new Error(
            `Missing database credentials. ` +
              `USERNAME: ${!!username}, PASSWORD: ${!!password}`,
          );
        }

        return {
          type: 'postgres',
          host: host,
          port: port,
          username: username,
          password: password,
          database: database,
          entities: [BookEntity, BookShelfEntity, UserEntity, RoleEntity],
          synchronize: !isProduction,
          logging: !isProduction,
          namingStrategy: new SnakeNamingStrategy(),
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class TypeOrmConfigModule {}
