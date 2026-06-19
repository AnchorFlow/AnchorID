import { Module } from '@nestjs/common';
import { ConsentsModule } from '../consents/consents.module';
import { AccessRequestsService } from './access-requests.service';
import { AccessRequestsController } from './access-requests.controller';

@Module({
  imports: [ConsentsModule],
  providers: [AccessRequestsService],
  controllers: [AccessRequestsController],
  exports: [AccessRequestsService],
})
export class AccessRequestsModule {}
