import { AutoIncrement, BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

import GamePlatform from './game_platform';
import User from './user';

@Table
export default class GameCompletion extends Model<GameCompletion> {

    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    gameCompletionId!: number;

    @ForeignKey(() => GamePlatform)
    @Column(DataType.INTEGER)
    gamePlatformId!: number;

    @BelongsTo(() => GamePlatform)
    gamePlatform!: GamePlatform;

    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    userId!: number;

    @BelongsTo(() => User)
    owner!: User;

    @Column(DataType.DATE)
    date!: Date;
}
