import { AutoIncrement, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

import Game from './game';
import Platform from './platform';

@Table
export default class GamePlatform extends Model<GamePlatform> {

    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;

    //@PrimaryKey
    @ForeignKey(() => Game)
    @Column(DataType.INTEGER)
    gameId!: number;

    //@PrimaryKey
    @ForeignKey(() => Platform)
    @Column(DataType.INTEGER)
    platformId!: number;

    @Column(DataType.STRING)
    alias!: string;
}
