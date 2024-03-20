import { Module } from '@nestjs/common';
import { PresenceController } from './presence.controller';
import { PresenceService } from './presence.service';
import { SharedModule } from '@app/shared/modules/shared.module';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from '@app/shared';

@Module({
  imports: [
  
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
  ],
  controllers: [PresenceController],
  providers: [PresenceService],
})
export class PresenceModule { }
