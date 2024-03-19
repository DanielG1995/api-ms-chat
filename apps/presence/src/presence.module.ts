import { Module } from '@nestjs/common';
import { PresenceController } from './presence.controller';
import { PresenceService } from './presence.service';
import { SharedModule } from '@app/shared/modules/shared.module';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from '@app/shared';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env'
    }),
    SharedModule
  ],
  controllers: [PresenceController],
  providers: [PresenceService],
})
export class PresenceModule { }
