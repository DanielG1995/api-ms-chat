import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from '@app/shared/modules/shared.module';
import { JwtGuard } from 'apps/auth/src/jwt.guard';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env'
    }),
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
    SharedModule.registerRmq('PRESENCE_SERVICE', process.env.RABBITMQ_PRESENCE_QUEUE),
  ],

  controllers: [AppController],
  providers: [
    AppService,
    JwtGuard

  ],
})
export class AppModule { }
