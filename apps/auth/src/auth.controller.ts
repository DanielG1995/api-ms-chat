import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Ctx, MessagePattern, RmqContext } from '@nestjs/microservices';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) { }

 

  @MessagePattern({ cmd: 'get-users' })
  async getUser(@Ctx() ctx: RmqContext) {
    const channel = ctx.getChannelRef()
    const message = ctx.getMessage()
    channel.ack(message)
    return this.authService.getUsers();
  }

  @MessagePattern({ cmd: 'create-user' })
  async createUser(@Ctx() ctx: RmqContext) {
    const channel = ctx.getChannelRef()
    const message = ctx.getMessage()
    channel.ack(message)
    return this.authService.createUser()
  }
}
