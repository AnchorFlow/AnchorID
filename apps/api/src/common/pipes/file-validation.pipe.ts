import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
  isAllowedMimeType,
  matchesMagicBytes,
} from '@anchorid/shared';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('A file is required');
    }
    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      throw new BadRequestException(
        `File exceeds maximum size of ${MAX_DOCUMENT_SIZE_BYTES / (1024 * 1024)}MB`,
      );
    }
    if (!isAllowedMimeType(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type. Allowed: ${ALLOWED_DOCUMENT_MIME_TYPES.join(', ')}`,
      );
    }
    if (!matchesMagicBytes(file.buffer, file.mimetype)) {
      throw new BadRequestException('File content does not match declared type');
    }
    return file;
  }
}
