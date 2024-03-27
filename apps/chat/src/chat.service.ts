import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Conversation, Message } from './interfaces';
import { CreateMessageDTO } from './dtos/message.dto';

@Injectable()
export class ChatService {
  constructor(
    @Inject('MESSAGE_MODEL')
    private messageModel: Model<Message>,
    @Inject('CONVERSATION_MODEL')
    private conversationModel: Model<Conversation>
  ) { }
  async createMessage(createMessageDTO: CreateMessageDTO): Promise<Message> {
    const newMessage = new this.messageModel(createMessageDTO);
    return newMessage.save();
  }

  async getConversations(userId: number) {
    const allConversations =
      await this.conversationModel.find()
    const userConversations = [...allConversations.filter((conversation) => {
      return conversation.participants.includes(userId)
    })];

    return userConversations.map(uc => ({ _id: uc._id, lastMessage: uc.lastMessage, participants: uc.participants.filter(p => userId !== p) }))
  }

  async createConversation(userId: number, friendId: number) {
    const conversation = await this.conversationModel.findOne({ participants: { $all: [userId, friendId] } }).exec();
    if (!conversation) {
      const newConversation = new this.conversationModel({ participants: [userId, friendId], lastMessage: null });
      return await newConversation.save()
    }
    return conversation


  }
}
