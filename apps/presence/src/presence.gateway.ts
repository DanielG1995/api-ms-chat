import { UserJwt } from "@app/shared";
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { firstValueFrom } from "rxjs";
import { Server, Socket } from "socket.io";
import { ActiveUser } from "./interfaces/ActiveUser.interface";
import { FriendRequestEntity } from "@app/shared/entities/friend-request.entity";

@WebSocketGateway({ cors: true })
export class PresenceGateway
    implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
        @Inject(CACHE_MANAGER) private readonly cache: Cache
    ) { }
    async onModuleInit() {
        await this.cache.reset()
    }

    @WebSocketServer()
    server: Server

    private async setActivateStatus(socket: Socket, isActive: boolean) {
        const user = socket.data?.user
        if (!user) return;
        const activeUser: ActiveUser = {
            id: user.id,
            socketId: socket.id,
            isActive
        }
        await this.cache.set(`user ${user.id}`, activeUser, 0)
        await this.emitStatusToFriends(activeUser);
        if (!isActive) {
            socket.disconnect()
            await this.cache.del(`user ${user.id}`)
        }
    }

    async handleConnection(socket: Socket) {
        const jwt = socket.handshake.headers.authorization ?? null
        if (!jwt) {
            this.handleDisconnect(socket)
            return;
        }
        const ob$ = this.authService.send<UserJwt>({ cmd: 'decode-jwt' }, { jwt })
        const res = await firstValueFrom(ob$).catch(console.log)
        if (!res || !res?.user) {
            this.handleDisconnect(socket)
            return;
        }
        const { user } = res
        socket.data.user = user

        await this.setActivateStatus(socket, true)
    }

    async handleDisconnect(socket: Socket) {
        await this.setActivateStatus(socket, false)
    }

    private async getFriends(userId: number) {
        const ob$ = this.authService.send<FriendRequestEntity[]>({ cmd: 'get-friends' }, { userId })
        const friendsRequest = await firstValueFrom(ob$).catch(console.log)
        if (!friendsRequest) return;
        const friends = friendsRequest.map(fr => {
            if (!fr.receiver) return fr.creator
            const isCreator = userId === fr.creator.id
            const friendDetails = isCreator ? fr.receiver : fr.creator
            const { id, name, email } = friendDetails
            return {
                id, name, email
            }
        })
        return friends
    }

    private async emitStatusToFriends(activeUser: ActiveUser) {
        const friends = await this.getFriends(activeUser.id).catch((err) => { console.log(err); return [] })

        for (const f of friends) {
            const user = await this.cache.get(`user ${f.id}`)
            if (!user) return
            const friend = user as ActiveUser
            this.server.to(friend.socketId).emit('friendActive', {
                id: activeUser.id,
                isActive: activeUser.isActive
            })
            if (activeUser.isActive)
                setTimeout(() => {
                    this.server.to(activeUser.socketId).emit('friendActive', {
                        id: friend.id,
                        isActive: friend.isActive
                    })
                }, 2000);

        }

    }

    @SubscribeMessage('updateActiveStatus')
    async updateActiveStatus(socket: Socket, isActive: boolean) {
        if (!socket.data?.user) return;
        await this.setActivateStatus(socket, isActive)
    }



    @SubscribeMessage('get-friends')
    async getFriendsList(@ConnectedSocket() client: Socket) {
        if (!client.data?.user) return;
        const friends = await this.getFriends(client.data.user.id)
        client.emit('get-friends', friends)
    }

}