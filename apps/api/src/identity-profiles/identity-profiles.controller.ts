import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@anchorid/types';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { IdentityProfilesService } from './identity-profiles.service';
import { CreateIdentityProfileDto } from './dto/create-identity-profile.dto';
import { UpdateIdentityProfileDto } from './dto/update-identity-profile.dto';

@ApiTags('identity-profiles')
@ApiBearerAuth()
@Controller('identity-profiles')
export class IdentityProfilesController {
  constructor(private readonly identityProfilesService: IdentityProfilesService) {}

  @Get('me')
  getMine(@CurrentUser() user: AuthenticatedUser) {
    return this.identityProfilesService.findByUserId(user.id);
  }

  @Post('me')
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateIdentityProfileDto) {
    return this.identityProfilesService.create(user.id, dto);
  }

  @Patch('me')
  update(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateIdentityProfileDto) {
    return this.identityProfilesService.update(user.id, dto);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.identityProfilesService.findById(id);
  }
}
