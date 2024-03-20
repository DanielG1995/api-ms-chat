import { AuthGuard } from '@app/shared';
import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE') private authService: ClientProxy,
    @Inject('PRESENCE_SERVICE') private presenceService: ClientProxy
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

  @Post()
  async createUser() {
    return this.authService.send({
      cmd: 'create-user'
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

}
