import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { CurrentAnchor } from '../common/decorators/current-anchor.decorator';
import { ApiKeyGuard, type AuthenticatedAnchor } from '../common/guards/api-key.guard';
import { Public } from '../common/decorators/public.decorator';
import { CredentialsService } from './credentials.service';

@ApiTags('credentials')
@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Get('me')
  @ApiBearerAuth()
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.credentialsService.findMine(user.id);
  }

  @Get('by-address/:stellarAddress')
  @Public()
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('anchorApiKey')
  getForAnchor(
    @Param('stellarAddress') stellarAddress: string,
    @CurrentAnchor() anchor: AuthenticatedAnchor,
  ) {
    return this.credentialsService.getScopedDataForAnchor(anchor.anchorId, stellarAddress);
  }
}
