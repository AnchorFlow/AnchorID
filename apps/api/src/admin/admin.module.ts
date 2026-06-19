import { Module } from '@nestjs/common';
import { AnchorsModule } from '../anchors/anchors.module';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [AnchorsModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
