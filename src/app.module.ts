import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmConfigModule } from './modules/typeorm.module';
import { BooksModule } from './modules/book.module';
import { BookShelvesModule } from './modules/book-shelf.module';
import { UsersModule } from './modules/user.module';
import { SavedPositionsModule } from './modules/saved-position.module';
import { HealthModule } from './modules/health.module';
import { AuthorsModule } from './modules/author.module';

@Module({
  imports: [
    // Configuration first
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    HealthModule,

    // Database configuration
    TypeOrmConfigModule,

    // Feature modules
    BooksModule,
    BookShelvesModule,
    UsersModule,
    SavedPositionsModule,
    AuthorsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
