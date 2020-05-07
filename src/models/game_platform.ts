import { AllowNull, AutoIncrement, BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { Queryable } from '../api/decorators';
import Game from './game';
import Platform from './platform';

@Table
export default class GamePlatform extends Model<GamePlatform> {

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
