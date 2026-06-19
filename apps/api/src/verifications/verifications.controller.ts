import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@anchorid/types';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { VerificationsService } from './verifications.service';
import { UpdateVerificationDto } from './dto/update-verification.dto';

@ApiTags('verifications')
@ApiBearerAuth()
@Controller('verifications')
export class VerificationsController {
  constructor(private readonly verificationsService: VerificationsService) {}

  @Get('me')
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.verificationsService.findByUserId(user.id);
  }

  @Post(':identityProfileId')
  @Roles(Role.ADMIN)
  upsert(
    @Param('identityProfileId') identityProfileId: string,
    @CurrentUser() admin: AuthenticatedUser,
    @Body() dto: UpdateVerificationDto,
  ) {
    return this.verificationsService.upsertForProfile(identityProfileId, admin.id, dto);
  }
}
