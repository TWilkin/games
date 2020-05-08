import { AllowNull, AutoIncrement, BelongsTo, Column, DataType, ForeignKey, PrimaryKey, Table } from 'sequelize-typescript';

import { Queryable } from '../api/decorators';
import Game from './game';
import Platform from './platform';
import { AbstractRestrictedModel } from '../util/models';

@Table
export default class GamePlatform extends AbstractRestrictedModel<GamePlatform> {

    @Queryable
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    gamePlatformId!: number;

    @Queryable
    @ForeignKey(() => Game)
    @Column(DataType.INTEGER)
    gameId!: number;

    @BelongsTo(() => Game)
    game!: Game;

    @Queryable
    @ForeignKey(() => Platform)
    @Column(DataType.INTEGER)
    platformId!: number;

    @BelongsTo(() => Platform)
    platform!: Platform;

    @Queryable
    @AllowNull(true)
    @Column(DataType.STRING)
    alias!: string;
    
}
