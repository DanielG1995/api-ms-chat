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
    // async onModuleInit() {
    //     await this.cache.reset()
    // }

    @WebSocketServer()
    server: Server

    decodeJWT(token: string) {
        return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    }


    async handleConnection(socket: Socket) {
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
        const friends = [user.user.id === 1 ? 2 : 1]
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
    async getFriendsList(@ConnectedSocket() client: Socket, @MessageBody() message: Message) {
        if (!client.data?.user) return;
        const user = await this.cache.get(`conversationUser${message.friendId}`)
        const friend = user as ActiveUser
        console.log(`Message to ${message.friendId}`)
        if (!friend) return;
        this.server.to(friend.socketId).emit('message', message)

    }

    @SubscribeMessage('getConversations')
    async getConversations(socket: Socket) {
        const { user } = socket.data;

        if (!user) return;

        const conversations = await this.chatService.getConversations(user.id);
        this.server.to(socket.id).emit('getAllConversations', conversations);
    }

    private async createConversations(socket: Socket, userId: number, friends: number[]) {
        // const ob2$ = this.authService.send(
        //     {
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
            await this.chatService.createConversation(socket.data.user.id, friend);
        });
    }


}