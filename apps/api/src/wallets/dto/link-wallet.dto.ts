import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class LinkWalletDto {
  @ApiProperty({ example: 'GABC...XYZ' })
  @IsString()
  @Length(56, 56)
  @Matches(/^G[A-Z2-7]{55}$/)
  stellarAddress!: string;

  @ApiProperty({ description: 'Base64-encoded signed challenge transaction XDR' })
  @IsString()
  transactionXdr!: string;
}
