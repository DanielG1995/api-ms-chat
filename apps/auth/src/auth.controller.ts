import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { SharedService } from '@app/shared/services/shared.service';
import { NewUserDTO } from './dtos/new-user.dto';
import { LoginDTO } from './dtos/login.dto';
import { JwtGuard } from './jwt.guard';

@Controller()
export class AuthController {
  constructor(
    @Inject('AuthServiceInterface')
    private readonly authService: AuthService,
    @Inject('SharedServiceInterface')
    private readonly sharedService: SharedService
  ) { }



  @MessagePattern({ cmd: 'get-users' })
  async getUser(@Ctx() ctx: RmqContext) {
    this.sharedService.acknowledgeMessage(ctx)
    return this.authService.getUsers();
  }



  @MessagePattern({ cmd: 'register' })
  async register(
    @Ctx() ctx: RmqContext,
    @Payload() newUser: NewUserDTO
  ) {
    console.log('newUser', newUser)
    this.sharedService.acknowledgeMessage(ctx)
    return this.authService.register(newUser)
  }

  @MessagePattern({ cmd: 'login' })
  async login(
    @Ctx() ctx: RmqContext,
    @Payload() loginUser: LoginDTO
  ) {
    console.log('newUser', loginUser)
    this.sharedService.acknowledgeMessage(ctx)
    return this.authService.login(loginUser)
  }

  @MessagePattern({ cmd: 'verify-jwt' })
  @UseGuards(JwtGuard)
  async verifyJwt(
    @Ctx() ctx: RmqContext,
    @Payload() payload: { jwt: string }
  ) {
    this.sharedService.acknowledgeMessage(ctx)
    return this.authService.verifyJwt(payload.jwt)
  }

  @MessagePattern({ cmd: 'decode-jwt' })
  async decodeJwt(
    @Ctx() ctx: RmqContext,
    @Payload() payload: { jwt: string }
  ) {
    this.sharedService.acknowledgeMessage(ctx)
    return this.authService.getUserFromHeader(payload.jwt)
  }

  @MessagePattern({ cmd: 'add-friend' })
  async addFriendResponse(
    @Ctx() ctx: RmqContext,
    @Payload() payload: { userId: number; friendId: number },
  ) {
    this.sharedService.acknowledgeMessage(ctx)
    return this.authService.addFriend(payload.userId, payload.friendId)
  }

  @MessagePattern({ cmd: 'get-friends' })
  async getFriendsResponse(
    @Ctx() ctx: RmqContext,
    @Payload() payload: { userId: number },

  ) {
    this.sharedService.acknowledgeMessage(ctx)
    return this.authService.getFriends(payload.userId)
  }
}
