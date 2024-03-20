import { NestFactory } from '@nestjs/core';
import { PresenceModule } from './presence.module';
import { ConfigService } from '@nestjs/config';
import { SharedService } from '@app/shared/services/shared.service';
import { MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(PresenceModule);
  app.enableCors()
  const configService = app.get(ConfigService)
  const sharedService = app.get(SharedService)

  const queue = configService.get('RABBITMQ_PRESENCE_QUEUE')
  app.connectMicroservice<MicroserviceOptions>(sharedService.getRmqOptions(queue))

  await app.startAllMicroservices();
  await app.listen(6000)
}
bootstrap();
