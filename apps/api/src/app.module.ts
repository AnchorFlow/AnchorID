import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './common/storage/storage.module';
import { StellarModule } from './stellar/stellar.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import { IdentityProfilesModule } from './identity-profiles/identity-profiles.module';
import { DocumentsModule } from './documents/documents.module';
import { VerificationsModule } from './verifications/verifications.module';
import { CredentialsModule } from './credentials/credentials.module';
import { ConsentsModule } from './consents/consents.module';
import { AccessRequestsModule } from './access-requests/access-requests.module';
import { AnchorsModule } from './anchors/anchors.module';
import { AdminModule } from './admin/admin.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 60_000, limit: 100 }] }),
    PrismaModule,
    StorageModule,
    StellarModule,
    AuthModule,
    UsersModule,
    WalletsModule,
    IdentityProfilesModule,
    DocumentsModule,
    VerificationsModule,
    CredentialsModule,
    ConsentsModule,
    AccessRequestsModule,
    AnchorsModule,
    AdminModule,
    AuditLogsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
