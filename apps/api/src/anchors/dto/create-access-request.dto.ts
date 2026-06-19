import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { CONSENT_SCOPES, type ConsentScope } from '@anchorid/types';

export class CreateAccessRequestDto {
  @ApiProperty()
  @IsString()
  @Length(56, 56)
  @Matches(/^G[A-Z2-7]{55}$/)
  stellarAddress!: string;

  @ApiProperty({ enum: CONSENT_SCOPES, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @IsIn(CONSENT_SCOPES, { each: true })
  scopes!: ConsentScope[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @ApiProperty({ required: false, default: 90 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  requestedExpiryDays?: number;
}
