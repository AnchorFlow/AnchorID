import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class ChallengeRequestDto {
  @ApiProperty({ example: 'GABC...XYZ', description: 'Stellar public address (G...)' })
  @IsString()
  @Length(56, 56)
  @Matches(/^G[A-Z2-7]{55}$/)
  stellarAddress!: string;
}
