import { Controller, Get, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE') private authService: ClientProxy
  ) { }

  @Get()
  async getUsers() {
    return await firstValueFrom( this.authService.send({
      cmd: 'get-users'
    }, {}))
  }

  @Post()
  async createUser() {
    return await firstValueFrom( this.authService.send({
      cmd: 'create-user'
    }, {}))
  }

}
