import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PostgresDBModule, SharedService } from '@app/shared';
import { UserEntity } from '../../../libs/shared/src/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '@app/shared/modules/shared.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from './jwt.guard';
import { JwtStrategy } from './jwt.strategy';
import { UsersRepository } from '@app/shared/repositories/users.repository';
import { FriendRequestsRepository } from '@app/shared/repositories/friend-requests.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env'
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '7200s'
          }
        }
      },
      inject: [ConfigService]
    }),
    SharedModule,
    PostgresDBModule,
    TypeOrmModule.forFeature([UserEntity])
  ],
  controllers: [AuthController],
  providers: [JwtGuard, JwtStrategy,
    {
      provide: 'AuthServiceInterface',
      useClass: AuthService
    },
    {
      provide: 'UsersRepositoryInterface',
      useClass: UsersRepository
    },
    {
      provide: 'FriendRequestsRepositoryInterface',
      useClass: FriendRequestsRepository
    },
    {
      provide: 'SharedServiceInterface',
      useClass: SharedService,
    },
  ],

})
export class AuthModule { }
