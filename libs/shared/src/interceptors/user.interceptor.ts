import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { AuthService } from "apps/auth/src/auth.service";
import { Observable, catchError, switchMap } from "rxjs";

@Injectable()
export class UserInterceptor implements NestInterceptor {

    constructor(
        @Inject('AUTH_SERVICE')
        private readonly authService: ClientProxy
    ) {

    }

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        if (context.getType() !== 'http') return next.handle()

        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next.handle();
        }

        const jwt = authHeader.split(' ')[1];

        if (!jwt) {
            return next.handle();
        }
        return this.authService.send({ cmd: 'decode-jwt' }, { jwt }).
            pipe(
                switchMap(({ user }) => {
                    request.user = user;
                    return next.handle()
                }),
                catchError(() => next.handle())
            )
    }


}