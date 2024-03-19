import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt'

import { UserEntity } from './user.entity';
import { NewUserDTO } from './dtos/new-user.dto';
import { LoginDTO } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService
  ) { }

  async getUsers(): Promise<UserEntity[]> {
    return this.userRepository.find()
  }

  async findByEmail(email: string): Promise<UserEntity> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'password']
    })

  }

  async hashPasword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  async register(user: NewUserDTO): Promise<UserEntity> {
    const { name, email, password } = user;
    const existingUser = await this.findByEmail(email)
    if (existingUser) {
      throw new ConflictException('An account with that email already exists')
    }
    const hashedPassword = await this.hashPasword(password)
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

  async login(userLogin: LoginDTO) {
    const { email, password } = userLogin
    const user = await this.validateUser(email, password)
    if (!user) {
      throw new UnauthorizedException();
    }
    const jwt = await this.jwtService.signAsync({
      user
    })

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
