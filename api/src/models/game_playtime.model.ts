import { AllowNull, AutoIncrement, BelongsTo, Column, DataType, ForeignKey, PrimaryKey, Table } from 'sequelize-typescript';

import { Queryable } from '../api/decorators';
import GameCompilation from './game_compilation.model';
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

    @Queryable
    @AllowNull
    @ForeignKey(() => GameCompilation)
    @Column(DataType.INTEGER)
    gameCompilationId!: number;

    @BelongsTo(() => GameCompilation)
    compilation!: GameCompilation;

    @Column(DataType.DATE)
    startTime!: Date;

    @Queryable
    @AllowNull(true)
    @Column(DataType.DATE)
    endTime!: Date;

    @Column(DataType.BOOLEAN)
    demo!: boolean;

}
