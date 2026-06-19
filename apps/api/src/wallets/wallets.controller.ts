import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { WalletsService } from './wallets.service';
import { LinkWalletDto } from './dto/link-wallet.dto';

@ApiTags('wallets')
@ApiBearerAuth()
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get('me')
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.walletsService.findMine(user.id);
  }

  @Post('me')
  link(@CurrentUser() user: AuthenticatedUser, @Body() dto: LinkWalletDto, @Req() req: Request) {
    return this.walletsService.link(user.id, dto, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Patch('me/:id/primary')
  setPrimary(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.walletsService.setPrimary(user.id, id);
  }

  @Delete('me/:id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.walletsService.remove(user.id, id);
  }
}
