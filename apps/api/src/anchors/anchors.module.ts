import { Module } from '@nestjs/common';
import { AnchorsService } from './anchors.service';
import { AnchorsController } from './anchors.controller';

@Module({
  providers: [AnchorsService],
  controllers: [AnchorsController],
  exports: [AnchorsService],
})
export class AnchorsModule {}
