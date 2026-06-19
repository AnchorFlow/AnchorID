import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@anchorid/types';
import { Roles } from '../common/decorators/roles.decorator';
import { AuditLogsService } from './audit-logs.service';

@ApiTags('audit-logs')
@ApiBearerAuth()
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'actorId', required: false })
  findAll(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '25',
    @Query('action') action?: string,
    @Query('actorId') actorId?: string,
  ) {
    return this.auditLogsService.findAll({
      page: parseInt(page, 10),
      pageSize: Math.min(parseInt(pageSize, 10), 100),
      action,
      actorId,
    });
  }
}
