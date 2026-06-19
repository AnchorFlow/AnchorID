import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { CurrentAnchor } from '../common/decorators/current-anchor.decorator';
import { ApiKeyGuard, type AuthenticatedAnchor } from '../common/guards/api-key.guard';
import { Public } from '../common/decorators/public.decorator';
import { AccessRequestsService } from './access-requests.service';
import { CreateAccessRequestDto } from '../anchors/dto/create-access-request.dto';

@ApiTags('access-requests')
@Controller('access-requests')
export class AccessRequestsController {
  constructor(private readonly accessRequestsService: AccessRequestsService) {}

  @Post()
  @Public()
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('anchorApiKey')
  create(@CurrentAnchor() anchor: AuthenticatedAnchor, @Body() dto: CreateAccessRequestDto) {
    return this.accessRequestsService.createForAnchor(anchor.anchorId, dto);
  }

  @Get('me')
  @ApiBearerAuth()
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.accessRequestsService.findMineForUser(user.id);
  }

  @Get('anchor/:anchorId')
  @ApiBearerAuth()
  findForAnchor(@Param('anchorId') anchorId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.accessRequestsService.findForAnchor(anchorId, user.id);
  }

  @Patch(':id/approve')
  @ApiBearerAuth()
  approve(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.accessRequestsService.approve(user.id, id);
  }

  @Patch(':id/deny')
  @ApiBearerAuth()
  deny(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.accessRequestsService.deny(user.id, id);
  }
}
