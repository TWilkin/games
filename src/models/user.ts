import { AutoIncrement, Column, DataType, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { Queryable } from '../api/queryable';
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

    @HasMany(() => GameCollection)
    games!: GameCollection[];

    @HasMany(() => GamePlayTime)
    playTime!: GamePlayTime[];

    @HasMany(() => GameCompletion)
    completed!: GameCompletion[];
}
