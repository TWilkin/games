import { AutoIncrement, BelongsTo, Column, DataType, ForeignKey, PrimaryKey, Table } from 'sequelize-typescript';

import { Queryable } from '../api/decorators';
import GamePlatform from './game_platform.model';
import { AbstractOwnableModel } from './ownablemodel';

@Table
export default class GameCompletion extends AbstractOwnableModel<GameCompletion> {

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

    @Column(DataType.DATE)
    date!: Date;
    
}
