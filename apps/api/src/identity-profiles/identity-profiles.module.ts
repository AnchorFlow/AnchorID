import { Module } from '@nestjs/common';
import { IdentityProfilesService } from './identity-profiles.service';
import { IdentityProfilesController } from './identity-profiles.controller';

@Module({
  providers: [IdentityProfilesService],
  controllers: [IdentityProfilesController],
  exports: [IdentityProfilesService],
})
export class IdentityProfilesModule {}
