import { AutoIncrement, BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

import Game from './game';
import Platform from './platform';

@Table
export default class GamePlatform extends Model<GamePlatform> {

    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;

    @ForeignKey(() => Game)
    @Column(DataType.INTEGER)
    gameId!: number;

    @BelongsTo(() => Game)
    game!: Game;

    @ForeignKey(() => Platform)
    @Column(DataType.INTEGER)
    platformId!: number;

    @BelongsTo(() => Platform)
    platform!: Platform;

    @Column(DataType.STRING)
    alias!: string;
}
