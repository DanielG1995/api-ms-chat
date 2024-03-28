import { UserJwt } from "@app/shared";
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { firstValueFrom } from "rxjs";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { ActiveUser } from "apps/presence/src/interfaces/ActiveUser.interface";

@WebSocketGateway({ cors: true })
export class ChatGateway
    implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        // @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
        @Inject(CACHE_MANAGER) private readonly cache: Cache,
        private readonly chatService: ChatService
    ) { }
    async onModuleInit() {
        await this.cache.reset()
    }

    @WebSocketServer()
    server: Server

    decodeJWT(token: string) {
        return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    }


    async handleConnection(@ConnectedSocket() socket: Socket) {
        const jwt = socket.handshake.headers.authorization ?? null
        if (!jwt) {
            this.handleDisconnect(socket)
            return;
        }
        // const ob$ = this.authService.send<UserJwt>({ cmd: 'decode-jwt' }, { jwt })
        // const res = await firstValueFrom(ob$).catch(console.log)
        // if (!res || !res?.user) {
        //     this.handleDisconnect(socket)
        //     return;
        // }
        // const { user } = res
        // socket.data.user = user
        const user = await this.decodeJWT(jwt)
        socket.data.user = user.user;
        const mockFriends = {
            1: [{ name: 'Alejandro', id: 2 }, { name: 'Gallardo', id: 3 }],
            2: [{ name: 'Daniel', id: 1 }, { name: 'Gallardo', id: 3 }],
            3: [{ name: 'Alejandro', id: 2 }, { name: 'Daniel', id: 1 }]
        }
        const friends = mockFriends[user.user.id]
        await this.setConversationUser(socket); //cache
        await this.createConversations(socket, user.id, friends); //crea conversaciones con amigos
        // await this.getConversations(socket); //obtiene las conversaciones
    }

    private async setConversationUser(socket: Socket) {
        const user = socket.data?.user;

        if (!user || !user.id) return;

        const conversationUser = { id: user.id, socketId: socket.id };
        try {
            console.log(`User ${user.id} connected on conversationUser${user.id}${user.id}`)
            await this.cache.set(`conversationUser${user.id}`, conversationUser, 0)

        } catch (error) {
            throw new Error(error)
        }
    }

    async handleDisconnect(socket: Socket) {
        socket.disconnect()
    }


    @SubscribeMessage('new-message')
    async newMessage(@ConnectedSocket() client: Socket, @MessageBody() messageSocket: Message) {
        if (!client.data?.user) return;
        const { conversationId, friendId, date, message, sendId } = messageSocket
        const messageDB = await this.chatService.createMessage({ conversationId, friendId, date, message, sendId })
        if (messageDB) {
            messageSocket.date = messageDB.date
            this.chatService.updateLastMessage(conversationId, messageDB)
        }
        const user = await this.cache.get(`conversationUser${messageSocket.friendId}`)
        const friend = user as ActiveUser
        console.log(`Message to ${messageSocket.friendId}, ${messageSocket.message}, ${client.id}`)
        if (!friend) return;
        this.server.to(friend.socketId).emit('message', messageDB)

    }

    @SubscribeMessage('getConversations')
    async getConversations(@ConnectedSocket() socket: Socket) {
        const { user } = socket.data;

        if (!user) return;

        const conversations = await this.chatService.getConversations(user.id);
        this.server.to(socket.id).emit('getAllConversations', conversations);
    }

    @SubscribeMessage('get-messages')
    async getMessages(@ConnectedSocket() socket: Socket, @MessageBody() conversationId: string) {
        const { user } = socket.data;
        if (!user) return;
        console.log('get-messages', conversationId)
        const messages = await this.chatService.getMessagesByConversation(conversationId)
        this.server.to(socket.id).emit('get-messages', messages);
    }

    private async createConversations(socket: Socket, userId: number, friends: Record<string, any>[]) {
        // const ob2$ = this.authService.send(
        //     
        //         cmd: 'get-friends-list',
        //     },
        //     {
        //         userId,
        //     },
        // );

        // const friends = await firstValueFrom(ob2$).catch((err) =>
        //     console.error(err),
        // );

        friends.forEach(async (friend) => {
            await this.chatService.createConversation({ id: socket.data.user.id, name: socket.data.user.name }, friend);
        });
    }


}