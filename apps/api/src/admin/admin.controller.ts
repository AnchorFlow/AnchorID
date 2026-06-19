import { Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@anchorid/types';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { AnchorsService } from '../anchors/anchors.service';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly anchorsService: AnchorsService,
  ) {}

  @Get('dashboard')
  dashboard() {
    return this.adminService.dashboard();
  }

  @Patch('users/:id/suspend')
  suspendUser(@Param('id') id: string, @CurrentUser() admin: AuthenticatedUser) {
    return this.adminService.suspendUser(id, admin.id);
  }

  @Patch('users/:id/reactivate')
  reactivateUser(@Param('id') id: string, @CurrentUser() admin: AuthenticatedUser) {
    return this.adminService.reactivateUser(id, admin.id);
  }

  @Patch('anchors/:id/suspend')
  suspendAnchor(@Param('id') id: string, @CurrentUser() admin: AuthenticatedUser) {
    return this.anchorsService.suspend(id, admin.id);
  }
}
