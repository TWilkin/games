import { AllowNull, AutoIncrement, BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { Queryable } from '../api/decorators';
import GamePlatform from './game_platform';
import User from './user';

@Table
export default class GamePlayTime extends Model<GamePlayTime> {

    @Queryable
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    gamePlayTimeId!: number;

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
    startTime!: Date;

    @AllowNull(true)
    @Column(DataType.DATE)
    endTime!: Date;
}
