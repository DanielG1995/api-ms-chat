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

  async getMessagesByConversation(id: string) {
    const messages = await this.messageModel.find({ conversationId: id }).exec();
    return messages
  }

  async getConversations(userId: number) {
    const allConversations =
      await this.conversationModel.find()
    const userConversations = [...allConversations.filter((conversation) => {
      return conversation.participants.find(p => p.id === userId)
    })];

    return userConversations.map(uc => ({ _id: uc._id, lastMessage: uc.lastMessage, participants: uc.participants.filter(p => userId !== p.id).map(p => ({ id: p.id, name: p.name })) }))
  }

  async createConversation(userId: Record<string, any>, friendId: Record<string, any>) {
    try {
      const conversation = await this.conversationModel.findOne({
        $and: [
          { "participants.id": friendId.id },
          { "participants.id": userId.id }
        ]
      }).exec();
      if (!conversation) {
        const newConversation = new this.conversationModel({ participants: [userId, friendId], lastMessage: null });
        return await newConversation.save()
      }
      return conversation
    } catch (error) {
      console.error(error)
    }




  }

  updateLastMessage = async (conversationId: string, message: Message) => {
    try {
      await this.conversationModel.findOneAndUpdate({ _id: conversationId }, { lastMessage: message })
    } catch (error) {
    }
  }
}
