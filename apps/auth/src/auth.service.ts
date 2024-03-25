import { BadRequestException, ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt'

import { FriendRequestsRepositoryInterface, UserEntity, UserJwt } from '@app/shared';
import { NewUserDTO } from './dtos/new-user.dto';
import { LoginDTO } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthServiceInterface } from './interfaces/auth.service.interface';
import { FriendRequestEntity } from '@app/shared/entities/friend-request.entity';
import { FriendRequestsRepository } from '@app/shared/repositories/friend-requests.repository';
import { UserRepositoryInterface } from '@app/shared/interfaces/users.repository.interface';


@Injectable()
export class AuthService implements AuthServiceInterface {
  constructor(
    @Inject('UsersRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
    @Inject('FriendRequestsRepositoryInterface')
    private readonly friendsRequestRepository: FriendRequestsRepositoryInterface,
    private readonly jwtService: JwtService
  ) { }
  getUserById(id: number): Promise<UserEntity> {
    throw new Error('Method not implemented.');
  }


  async getUsers(): Promise<UserEntity[]> {
    return this.userRepository.findAll()
  }

  async findByEmail(email: string): Promise<UserEntity> {
    return this.userRepository.findByCondition({
      where: { email },
      select: ['id', 'name', 'email', 'password']
    })

  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  async register(user: NewUserDTO): Promise<UserEntity> {
    const { name, email, password } = user;
    const existingUser = await this.findByEmail(email)
    if (existingUser) {
      throw new ConflictException('An account with that email already exists')
    }
    const hashedPassword = await this.hashPassword(password)
    const savedUser = await this.userRepository.save({ name, password: hashedPassword, email })
    delete savedUser.password
    return savedUser
  }

  async passwordMatch(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword)
  }

  async validateUser(email: string, password: string) {
    const existingUser = await this.findByEmail(email)
    if (!existingUser) return null
    const passwordMatch = await this.passwordMatch(password, existingUser.password)

    return passwordMatch ? existingUser : null

  }

  async login(userLogin: Readonly<LoginDTO>) {
    const { email, password } = userLogin
    const user = await this.validateUser(email, password)
    if (!user) {
      throw new UnauthorizedException();
    }
    const token = await this.jwtService.signAsync({
      user
      
    })

    return { token }

  }

  async verifyJwt(jwt: string): Promise<{ exp: number }> {
    if (!jwt) throw new UnauthorizedException()
    try {
      const { exp } = await this.jwtService.verifyAsync(jwt)
      return { exp }
    } catch (error) {
      throw new UnauthorizedException()
    }
  }

  async findById(id: number): Promise<UserEntity> {
    return this.userRepository.findOneById(id)
  }

  async getUserFromHeader(jwt: string): Promise<UserJwt> {
    if (!jwt) return;
    try {
      return this.jwtService.decode(jwt) as UserJwt
    } catch (error) {
      throw new BadRequestException()
    }
  }
  async addFriend(userId: number, friendId: number): Promise<FriendRequestEntity> {
    const creator = await this.findById(userId)
    const receiver = await this.findById(friendId)
    console.log(creator, receiver)
    return await this.friendsRequestRepository.save({
      creator,
      receiver
    })

  }

  async getFriends(user: number): Promise<FriendRequestEntity[]> {
    const creator = await this.userRepository.findOneById(user)
    return await this.friendsRequestRepository.findWithRelations(
      {
        where: [{ creator }, { receiver: creator }],
        relations: ['creator', 'receiver']
      }
    )
  }

}
