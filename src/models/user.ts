import bcrypt from 'bcrypt';
import { AutoIncrement, BeforeCreate, BeforeUpdate, Column, DataType, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { Queryable, Secret } from '../api/decorators';
import GameCollection from './game_collection';
import GameCompletion from './game_completion';
import GamePlayTime from './game_playtime';

@Table
export default class User extends Model<User> {

    @Queryable
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    userId!: number;

    @Queryable
    @Column(DataType.STRING)
    userName!: string;

    @Secret
    @Column(DataType.STRING)
    password!: string;

    @Column(DataType.STRING)
    email!: string;

    @HasMany(() => GameCollection)
    games!: GameCollection[];

    @HasMany(() => GamePlayTime)
    playTime!: GamePlayTime[];

    @HasMany(() => GameCompletion)
    completed!: GameCompletion[];

    @BeforeCreate
    @BeforeUpdate
    static async hashPassword(instance: User) {
        instance.password = await bcrypt.hash(instance.password, 10);
    }

    static async login(userName: string, password: string): Promise<User | null> {
        // find the user
        const user = await User.findOne({
            attributes: [ 'userId', 'password' ],
            where: { userName: userName }
        });
        if(user) {
            // check the password
            if(await bcrypt.compare(password, user.password)) {
                return user;
            }
        }

        // return null when the user did not pass authentication
        return null;
    }

}
