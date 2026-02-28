import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedPositionEntity } from 'src/infrastructure/database/saved-position.entity';
import { TypeOrmSavedPositionRepository } from 'src/infrastructure/repositories/saved-position.repository';
import { GetSavedPositionsUseCase } from 'src/application/usecases/saved-position/get-saved-positions.usecase';
import { GetSavedPositionUseCase } from 'src/application/usecases/saved-position/get-saved-position.usecase';
import { SavePositionUseCase } from 'src/application/usecases/saved-position/save-position.usecase';
import { DeleteSavedPositionUseCase } from 'src/application/usecases/saved-position/delete-saved-position.usecase';
import { SavedPositionMapper } from 'src/infrastructure/mappers/saved-position.mapper';
import { SavedPositionController } from 'src/presentation/controllers/saved-position.controller';
import { AuthModule } from 'src/modules/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SavedPositionEntity]),
    AuthModule,
  ],
  providers: [
    {
      provide: 'SavedPositionRepository',
      useClass: TypeOrmSavedPositionRepository,
    },
    GetSavedPositionsUseCase,
    GetSavedPositionUseCase,
    SavePositionUseCase,
    DeleteSavedPositionUseCase,
    SavedPositionMapper,
  ],
  controllers: [SavedPositionController],
  exports: ['SavedPositionRepository'],
})
export class SavedPositionsModule {}
