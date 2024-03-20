import { UserEntity } from '@app/shared';

import { NewUserDTO } from '../dtos/new-user.dto';
import { LoginDTO } from '../dtos/login.dto';

export interface AuthServiceInterface {
    getUsers(): Promise<UserEntity[]>;
    getUserById(id: number): Promise<UserEntity>;
    findByEmail(email: string): Promise<UserEntity>;
    findById(id: number): Promise<UserEntity>;
    hashPassword(password: string): Promise<string>;
    register(newUser: Readonly<NewUserDTO>): Promise<UserEntity>;
    passwordMatch(password: string, hashedPassword: string): Promise<boolean>;
    validateUser(email: string, password: string): Promise<UserEntity>;
    login(userLogin: Readonly<LoginDTO>): Promise<{
        token: string;
    }>;
    verifyJwt(jwt: string): Promise<{ exp: number }>;
}