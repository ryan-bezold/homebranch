import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/infrastructure/guards/jwt-auth.guard';
import { MapResultInterceptor } from '../interceptors/map_result.interceptor';
import { GetSavedPositionsUseCase } from 'src/application/usecases/saved-position/get-saved-positions.usecase';
import { GetSavedPositionUseCase } from 'src/application/usecases/saved-position/get-saved-position.usecase';
import { SavePositionUseCase } from 'src/application/usecases/saved-position/save-position.usecase';
import { DeleteSavedPositionUseCase } from 'src/application/usecases/saved-position/delete-saved-position.usecase';
import { SavePositionDto } from '../dtos/save-position.dto';
import { Request } from 'express';

@Controller('users/:userId/saved-positions')
@UseInterceptors(MapResultInterceptor)
@UseGuards(JwtAuthGuard)
export class SavedPositionController {
  constructor(
    private readonly getSavedPositionsUseCase: GetSavedPositionsUseCase,
    private readonly getSavedPositionUseCase: GetSavedPositionUseCase,
    private readonly savePositionUseCase: SavePositionUseCase,
    private readonly deleteSavedPositionUseCase: DeleteSavedPositionUseCase,
  ) {}

  @Get()
  getSavedPositions(@Req() req: Request) {
    const userId = req['user'].id;
    return this.getSavedPositionsUseCase.execute({ userId });
  }

  @Get(':bookId')
  getSavedPosition(@Req() req: Request, @Param('bookId') bookId: string) {
    const userId = req['user'].id;
    return this.getSavedPositionUseCase.execute({ bookId, userId });
  }

  @Put(':bookId')
  @HttpCode(204)
  savePosition(
    @Req() req: Request,
    @Param('bookId') bookId: string,
    @Body() dto: SavePositionDto,
  ) {
    const userId = req['user'].id;
    return this.savePositionUseCase.execute({
      bookId,
      userId,
      position: dto.position,
      deviceName: dto.deviceName,
    });
  }

  @Delete(':bookId')
  @HttpCode(204)
  deleteSavedPosition(@Req() req: Request, @Param('bookId') bookId: string) {
    const userId = req['user'].id;
    return this.deleteSavedPositionUseCase.execute({ bookId, userId });
  }
}
