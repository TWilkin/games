import { AutoIncrement, BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { Queryable } from '../api/queryable';
import GamePlatform from './game_platform';
import User from './user';

@Table
export default class GameCompletion extends Model<GameCompletion> {

    @Queryable
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    gameCompletionId!: number;

    @Queryable
    @ForeignKey(() => GamePlatform)
    @Column(DataType.INTEGER)
    gamePlatformId!: number;

    @BelongsTo(() => GamePlatform)
    gamePlatform!: GamePlatform;

    @Queryable
    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    userId!: number;

    @BelongsTo(() => User)
    owner!: User;

    @Column(DataType.DATE)
    date!: Date;
}
