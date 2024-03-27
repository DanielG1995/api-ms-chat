import { NestFactory } from '@nestjs/core';

import { ConfigService } from '@nestjs/config';
import { SharedService } from '@app/shared/services/shared.service';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ChatModule } from './chat.module';

async function bootstrap() {
  const app = await NestFactory.create(ChatModule);
  app.enableCors()
  const configService = app.get(ConfigService)
  const sharedService = app.get(SharedService)

  // const queue = configService.get('RABBITMQ_CHAT_QUEUE');
  // app.connectMicroservice<MicroserviceOptions>(sharedService.getRmqOptions(queue))

  await app.startAllMicroservices();
  await app.listen(2000)
}
bootstrap();
