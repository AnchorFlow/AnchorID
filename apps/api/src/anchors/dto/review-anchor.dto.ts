import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewAnchorDto {
  @ApiProperty() @IsBoolean() approve!: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(500) rejectionReason?: string;
}
