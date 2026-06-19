import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { DocumentStatus, Role } from '@anchorid/types';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { FileValidationPipe } from '../common/pipes/file-validation.pipe';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { ReviewDocumentDto } from './dto/review-document.dto';

@ApiTags('documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UploadDocumentDto,
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
  ) {
    return this.documentsService.upload(user.id, dto.type, file);
  }

  @Get('me')
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.documentsService.findMine(user.id);
  }

  @Get('review-queue')
  @Roles(Role.ADMIN)
  findReviewQueue(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '25',
    @Query('status') status?: DocumentStatus,
  ) {
    return this.documentsService.findAllForReview({
      page: parseInt(page, 10),
      pageSize: Math.min(parseInt(pageSize, 10), 100),
      status,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.documentsService.findByIdForUser(id, user);
  }

  @Get(':id/file')
  async streamFile(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response,
  ) {
    const { buffer, mimeType, fileName } = await this.documentsService.getFileBuffer(id, user);
    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `inline; filename="${fileName}"`,
    });
    res.send(buffer);
  }

  @Patch(':id/review')
  @Roles(Role.ADMIN)
  review(
    @Param('id') id: string,
    @CurrentUser() admin: AuthenticatedUser,
    @Body() dto: ReviewDocumentDto,
  ) {
    return this.documentsService.review(id, admin.id, dto.approve, dto.rejectionReason);
  }
}
