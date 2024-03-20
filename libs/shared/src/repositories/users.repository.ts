import { Injectable } from "@nestjs/common";
import { BaseAbstractRepository } from "./base/base.abstract.repository";
import { UserEntity } from "@app/shared/entities/user.entity";
import { UserRepositoryInterface } from "../interfaces/users.repository.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class UsersRepository extends BaseAbstractRepository<UserEntity> implements UserRepositoryInterface {

    constructor(
        @InjectRepository(UserEntity) private readonly UserRepository: Repository<UserEntity>
    ) {
        super(UserRepository)
    }

}