import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateIdentityProfileDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(120) firstName!: string;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(120) lastName!: string;
  @ApiProperty() @IsDateString() dateOfBirth!: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(60) nationality!: string;
  @ApiProperty() @IsString() @MinLength(3) @MaxLength(300) address!: string;
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty() @IsString() @MinLength(5) @MaxLength(30) phoneNumber!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(60) governmentIdType?: string;
  @ApiProperty() @IsString() @MinLength(3) @MaxLength(60) governmentIdNumber!: string;
}
