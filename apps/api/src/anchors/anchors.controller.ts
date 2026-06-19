import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AnchorStatus, Role } from '@anchorid/types';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AnchorsService } from './anchors.service';
import { RegisterAnchorDto } from './dto/register-anchor.dto';
import { ReviewAnchorDto } from './dto/review-anchor.dto';
import { AddAnchorMemberDto } from './dto/add-anchor-member.dto';
import { CreateApiCredentialDto } from './dto/create-api-credential.dto';

@ApiTags('anchors')
@ApiBearerAuth()
@Controller('anchors')
export class AnchorsController {
  constructor(private readonly anchorsService: AnchorsService) {}

  @Post()
  register(@CurrentUser() user: AuthenticatedUser, @Body() dto: RegisterAnchorDto) {
    return this.anchorsService.register(user.id, dto);
  }

  @Get('mine')
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.anchorsService.findMine(user.id);
  }

  @Get('review-queue')
  @Roles(Role.ADMIN)
  findReviewQueue(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '25',
    @Query('status') status?: AnchorStatus,
  ) {
    return this.anchorsService.findAllForReview({
      page: parseInt(page, 10),
      pageSize: Math.min(parseInt(pageSize, 10), 100),
      status,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.anchorsService.findById(id, user);
  }

  @Patch(':id/review')
  @Roles(Role.ADMIN)
  review(
    @Param('id') id: string,
    @CurrentUser() admin: AuthenticatedUser,
    @Body() dto: ReviewAnchorDto,
  ) {
    return this.anchorsService.review(id, admin.id, dto);
  }

  @Patch(':id/suspend')
  @Roles(Role.ADMIN)
  suspend(@Param('id') id: string, @CurrentUser() admin: AuthenticatedUser) {
    return this.anchorsService.suspend(id, admin.id);
  }

  @Get(':id/members')
  listMembers(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.anchorsService.listMembers(id, user);
  }

  @Post(':id/members')
  addMember(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AddAnchorMemberDto,
  ) {
    return this.anchorsService.addMember(id, user, dto);
  }

  @Delete(':id/members/:memberId')
  removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.anchorsService.removeMember(id, memberId, user);
  }

  @Get(':id/api-credentials')
  listApiCredentials(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.anchorsService.listApiCredentials(id, user);
  }

  @Post(':id/api-credentials')
  createApiCredential(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateApiCredentialDto,
  ) {
    return this.anchorsService.createApiCredential(id, user, dto);
  }

  @Delete(':id/api-credentials/:credentialId')
  revokeApiCredential(
    @Param('id') id: string,
    @Param('credentialId') credentialId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.anchorsService.revokeApiCredential(id, credentialId, user);
  }
}
