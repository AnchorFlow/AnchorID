import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { DocumentType } from '@anchorid/types';

export class UploadDocumentDto {
  @ApiProperty({ enum: Object.values(DocumentType) })
  @IsEnum(DocumentType)
  type!: DocumentType;
}
