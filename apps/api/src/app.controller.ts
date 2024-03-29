import { AuthGuard, SharedService, UserRequest } from '@app/shared';
import { UserInterceptor } from '@app/shared/interceptors/user.interceptor';
import { BadRequestException, Body, Controller, Get, HttpCode, Inject, Param, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ClientProxy, Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE') private authService: ClientProxy,
    @Inject('PRESENCE_SERVICE') private presenceService: ClientProxy,
    private sharedService: SharedService
  ) { }

  @Get()
  async getUsers() {
    return await firstValueFrom(this.authService.send({
      cmd: 'get-users'
    }, {}))
  }
  @UseGuards(AuthGuard)
  @Get('/presence')
  async getPresence() {
    return this.presenceService.send({
      cmd: 'presence'
    }, {})
  }


  @Post('/auth/register')
  async register(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.send({
      cmd: 'register'
    }, {
      name,
      email,
      password
    })
  }

  @Post('/auth/login')
  @HttpCode(200)
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.send({
      cmd: 'login'
    }, {
      email,
      password
    })
  }

  @Get('/auth/verify-token')
  @UseInterceptors(UserInterceptor)
  @UseGuards(AuthGuard)
  async verifyToken(@Req() req: UserRequest,) {
    if (!req?.user) {
      throw new BadRequestException()
    }
    return {
      hasAuth: true,
      user: req.user
    }
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Post('add-friend/:friendId')
  async addFriendRequest(
    @Req() req: UserRequest,
    @Param('friendId') friendId: number
  ) {

    if (!req?.user) {
      throw new BadRequestException()
    }
    return this.authService.send({
      cmd: 'add-friend'
    }, {
      userId: req.user.id,
      friendId
    })
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Get('get-friends')
  async getFriends(@Req() req: UserRequest) {
    if (!req?.user) {
      throw new BadRequestException()
    }

    return this.authService.send({
      cmd: 'get-friends'
    }, {
      userId: req.user.id,
    })
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Get('get-friends-list')
  async getFriendsList(@Req() req: UserRequest) {
    if (!req?.user) {
      throw new BadRequestException()
    }

    return this.authService.send({
      cmd: 'get-friends-list'
    }, {
      userId: req.user.id,
    })
  }

}
