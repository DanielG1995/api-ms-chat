import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { SharedService } from '@app/shared/services/shared.service';
import { NewUserDTO } from './dtos/new-user.dto';
import { LoginDTO } from './dtos/login.dto';
import { JwtGuard } from './jwt.guard';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
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
}
