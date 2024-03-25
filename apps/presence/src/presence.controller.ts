import { Controller, Get } from '@nestjs/common';
import { PresenceService } from './presence.service';
import { Ctx, MessagePattern, RmqContext } from '@nestjs/microservices';
import { SharedService, AuthGuard } from '@app/shared';


@Controller()
export class PresenceController {
  constructor(
    private readonly presenceService: PresenceService,
    //private readonly sharedService: SharedService,
  ) { }


  // @MessagePattern({ cmd: 'presence' })
  // async getUser(@Ctx() ctx: RmqContext) {
  //   this.sharedService.acknowledgeMessage(ctx)

  //   return this.presenceService.getHello()
  // }
}
