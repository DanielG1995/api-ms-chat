import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MongoModule } from '@app/shared/modules/mongodb.module';
import { Connection } from 'mongoose';
import { Conversation, Message } from '@app/shared/schemas';
import { SharedModule } from '@app/shared';
import { ChatGateway } from './chat.gateway';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    CacheModule.register(),
    MongoModule,
    SharedModule
    // SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
    // SharedModule.registerRmq(
    //   'PRESENCE_SERVICE',
    //   process.env.RABBITMQ_PRESENCE_QUEUE,
    // )
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway,
    {
      provide: 'MESSAGE_MODEL',
      useFactory: (connection: Connection) => connection.model('Message', Message),
      inject: ['DATABASE_CONNECTION'],
    },
    {
      provide: 'CONVERSATION_MODEL',
      useFactory: (connection: Connection) => connection.model('Conversation', Conversation),
      inject: ['DATABASE_CONNECTION'],
    }
  ],
})
export class ChatModule { }
