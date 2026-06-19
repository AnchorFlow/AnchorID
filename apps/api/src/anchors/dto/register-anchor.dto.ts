import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class RegisterAnchorDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(120) name!: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(160) legalName!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsUrl() website?: string;
  @ApiProperty() @IsString() @MinLength(3) @MaxLength(160) homeDomain!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(1000) description?: string;
}
