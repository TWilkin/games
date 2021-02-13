import bcrypt from 'bcryptjs';
import { AutoIncrement, BeforeCreate, BeforeUpdate, Column, DataType, Default, HasMany, PrimaryKey, Table } from 'sequelize-typescript';

import { Queryable, Secret } from '../api/decorators';
/*import GameCollection from './game_collection.model';
import GameCompletion from './game_completion.model';
import GamePlayTime from './game_playtime.model';*/
import { AbstractRestrictedModel } from './restrictedmodel';

export type Role = 'admin' | 'user';

@Table
export default class User extends AbstractRestrictedModel<User> {

    @Queryable
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    userId!: number;

    @Queryable
    @Column(DataType.STRING)
    userName!: string;

    @Secret()
    @Column(DataType.STRING)
    password!: string;

    @Column(DataType.STRING)
    email!: string;

    @Secret(true, true)
    @Default('user')
    @Column(DataType.ENUM('admin', 'user'))
    role!: Role;

    /*@HasMany(() => GameCollection)
    games!: GameCollection[];

    @HasMany(() => GamePlayTime)
    playTime!: GamePlayTime[];

    @HasMany(() => GameCompletion)
    completed!: GameCompletion[];*/

    public get isAdmin(): boolean {
        return this.role === 'admin';
    }

    @BeforeCreate
    @BeforeUpdate
    static async hashPassword(instance: User): Promise<void> {
        instance.password = await bcrypt.hash(instance.password, 10);
    }

    public static async authenticate(userName: string, password: string): Promise<User | null> {
        // find the user
        const user = await User.findOne({
            attributes: [ 'userId', 'userName', 'password', 'role' ],
            where: { userName: userName }
        });

        if(user) {
            // check the password
            if(await bcrypt.compare(password, user.password)) {
                return {
                    userId: user.userId,
                    userName: user.userName,
                    role: user.role
                } as User;
            }
        }

        // return null when the user did not pass authentication
        return null;
    }

}
