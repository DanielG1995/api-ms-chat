import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt'

import { UserEntity } from '../../../libs/shared/src/entities/user.entity';
import { NewUserDTO } from './dtos/new-user.dto';
import { LoginDTO } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthServiceInterface } from './interfaces/auth.service.interface';


@Injectable()
export class AuthService implements AuthServiceInterface {
  constructor(
    @Inject('UsersRepositoryInterface')
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService
  ) { }
  getUserById(id: number): Promise<UserEntity> {
    throw new Error('Method not implemented.');
  }
  findById(id: number): Promise<UserEntity> {
    throw new Error('Method not implemented.');
  }


  async getUsers(): Promise<UserEntity[]> {
    return this.userRepository.find()
  }

  async findByEmail(email: string): Promise<UserEntity> {
    return this.userRepository.findOne({
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

  async validateUser(email, password) {
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

}
