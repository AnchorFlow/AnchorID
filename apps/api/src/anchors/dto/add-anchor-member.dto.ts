import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';

export class AddAnchorMemberDto {
  @ApiProperty() @IsUUID() userId!: string;
  @ApiProperty({ enum: ['ANCHOR_ADMIN', 'ANCHOR_MEMBER'] })
  @IsEnum(['ANCHOR_ADMIN', 'ANCHOR_MEMBER'])
  role!: 'ANCHOR_ADMIN' | 'ANCHOR_MEMBER';
}
