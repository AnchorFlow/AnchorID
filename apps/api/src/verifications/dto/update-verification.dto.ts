import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { VerificationLevel, VerificationStatus } from '@anchorid/types';

export class UpdateVerificationDto {
  @ApiProperty({ enum: Object.values(VerificationStatus) })
  @IsEnum(VerificationStatus)
  status!: VerificationStatus;

  @ApiProperty({ enum: Object.values(VerificationLevel), required: false })
  @IsOptional()
  @IsEnum(VerificationLevel)
  level?: VerificationLevel;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
