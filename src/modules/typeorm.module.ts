import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookEntity } from 'src/infrastructure/database/book.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { BookShelfEntity } from '../infrastructure/database/book-shelf.entity';
import { SavedPositionEntity } from '../infrastructure/database/saved-position.entity';
import { AuthorEntity } from '../infrastructure/database/author.entity';
import { SchemaUpdate1755566512418 } from '../migrations/1755566512418-schema-update';
import { AddUserAndRoleTables1739836800000 } from '../migrations/1739836800000-AddUserAndRoleTables';
import { SeedAdminRole1739836800001 } from '../migrations/1739836800001-SeedAdminRole';
import { AddSavedPositionsTable1755566512419 } from '../migrations/1755566512419-AddSavedPositionsTable';
import { AddPercentageToSavedPosition1755566512420 } from '../migrations/1755566512420-AddPercentageToSavedPosition';
import { AddAuthorTable1740614850000 } from '../migrations/1740614850000-AddAuthorTable';
import { AddSummaryToBook1755566512421 } from '../migrations/1755566512421-AddSummaryToBook';
import { RemoveUserAndRoleTables1760000000000 } from '../migrations/1760000000000-RemoveUserAndRoleTables';

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
          entities: [
            BookEntity,
            BookShelfEntity,
            SavedPositionEntity,
            AuthorEntity,
          ],
          migrations: [
            SchemaUpdate1755566512418,
            AddUserAndRoleTables1739836800000,
            SeedAdminRole1739836800001,
            AddSavedPositionsTable1755566512419,
            AddPercentageToSavedPosition1755566512420,
            AddAuthorTable1740614850000,
            AddSummaryToBook1755566512421,
            RemoveUserAndRoleTables1760000000000,
          ],
          migrationsRun: true,
          migrationsTableName: 'migration_table',
          synchronize: false,
          logging: !isProduction,
          namingStrategy: new SnakeNamingStrategy(),
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class TypeOrmConfigModule {}
