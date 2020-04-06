import { AutoIncrement, BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

import GamePlatform from './game_platform';
import User from './user';

@Table
export default class GamePlayTime extends Model<GamePlayTime> {

    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    playTimeId!: number;

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
    startTime!: Date;

    @Column(DataType.DATE)
    endTime!: Date;
}
