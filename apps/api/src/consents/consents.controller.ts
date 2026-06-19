import { Controller, Delete, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { ConsentsService } from './consents.service';

@ApiTags('consents')
@ApiBearerAuth()
@Controller('consents')
export class ConsentsController {
  constructor(private readonly consentsService: ConsentsService) {}

  @Get('me')
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.consentsService.findMine(user.id);
  }

  @Delete(':id')
  revoke(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.consentsService.revoke(user.id, id);
  }
}
