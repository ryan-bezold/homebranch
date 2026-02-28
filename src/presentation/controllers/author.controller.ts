import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { join } from 'path';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/infrastructure/guards/jwt-auth.guard';
import { MapResultInterceptor } from '../interceptors/map_result.interceptor';
import { GetAuthorsUseCase } from 'src/application/usecases/author/get-authors.usecase';
import { GetAuthorUseCase } from 'src/application/usecases/author/get-author.usecase';
import { GetBooksByAuthorUseCase } from 'src/application/usecases/author/get-books-by-author.usecase';
import { UpdateAuthorUseCase } from 'src/application/usecases/author/update-author.usecase';
import { UploadAuthorProfilePictureUseCase } from 'src/application/usecases/author/upload-author-profile-picture.usecase';
import { PaginatedQuery } from 'src/core/paginated-query';
import { UpdateAuthorDto } from '../dtos/update-author.dto';

@Controller('authors')
@UseInterceptors(MapResultInterceptor)
@UseGuards(JwtAuthGuard)
export class AuthorController {
  constructor(
    private readonly getAuthorsUseCase: GetAuthorsUseCase,
    private readonly getAuthorUseCase: GetAuthorUseCase,
    private readonly getBooksByAuthorUseCase: GetBooksByAuthorUseCase,
    private readonly updateAuthorUseCase: UpdateAuthorUseCase,
    private readonly uploadAuthorProfilePictureUseCase: UploadAuthorProfilePictureUseCase,
  ) {}

  @Get()
  getAuthors(@Query() paginatedQuery: PaginatedQuery & { userId?: string }) {
    return this.getAuthorsUseCase.execute({ ...paginatedQuery });
  }

  @Get(':name')
  getAuthor(@Param('name') name: string) {
    return this.getAuthorUseCase.execute({ name });
  }

  @Get(':name/books')
  getBooksByAuthor(
    @Param('name') name: string,
    @Query() paginatedQuery: PaginatedQuery & { userId?: string },
  ) {
    return this.getBooksByAuthorUseCase.execute({ name, ...paginatedQuery });
  }

  @Patch(':name')
  updateAuthor(
    @Param('name') name: string,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ) {
    return this.updateAuthorUseCase.execute({ name, ...updateAuthorDto });
  }

  @Post(':name/profile-picture')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (
          _req: Express.Request,
          _file: Express.Multer.File,
          cb: (error: Error | null, destination: string) => void,
        ) => {
          cb(
            null,
            `${process.env.UPLOADS_DIRECTORY || join(process.cwd(), 'uploads')}/author-images`,
          );
        },
        filename: (
          _req: Express.Request,
          _file: Express.Multer.File,
          cb: (error: Error | null, filename: string) => void,
        ) => {
          cb(null, `${randomUUID()}.jpg`);
        },
      }),
    }),
  )
  uploadProfilePicture(
    @Param('name') name: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('A file must be provided');
    }
    const host = req.get('host');
    const protocol = req.protocol;
    const profilePictureUrl = `${protocol}://${host}/uploads/author-images/${file.filename}`;
    return this.uploadAuthorProfilePictureUseCase.execute({
      name,
      profilePictureUrl,
    });
  }
}
