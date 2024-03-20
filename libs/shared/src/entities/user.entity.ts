import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { FriendRequestEntity } from "./friend-request.entity";

@Entity('user')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column({ unique: true })
    email: string

    @Column({ select: false })
    password: string

    @OneToMany(
        () => FriendRequestEntity,
        (friendRequestEntity) =>
            friendRequestEntity.creator
    )
    friendRequestCreator: FriendRequestEntity[];

    @OneToMany(
        () => FriendRequestEntity,
        (friendRequestEntity) =>
            friendRequestEntity.receiver
    )
    friendRequestReceiver: FriendRequestEntity[];
}