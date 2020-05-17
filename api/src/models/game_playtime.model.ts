import { AllowNull, AutoIncrement, BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { Queryable } from '../api/decorators';
import GamePlatform from './game_platform.model';
import { AbstractOwnableModel } from './ownablemodel';

@Table
export default class GamePlayTime extends AbstractOwnableModel<GamePlayTime> {

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

    @Column(DataType.DATE)
    startTime!: Date;

    @Queryable
    @AllowNull(true)
    @Column(DataType.DATE)
    endTime!: Date;

}
