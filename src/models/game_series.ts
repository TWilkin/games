import { AutoIncrement, BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { Queryable } from '../api/queryable';
import Game from './game';
import Series from './series';

@Table
export default class GameSeries extends Model<GameSeries> {

    @Queryable
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    gameSeriesId!: number;

    @Queryable
    @ForeignKey(() => Game)
    @Column(DataType.INTEGER)
    gameId!: number;

    @BelongsTo(() => Game)
    game!: Game;

    @Queryable
    @ForeignKey(() => Series)
    @Column(DataType.INTEGER)
    seriesId!: number;

    @BelongsTo(() => Series)
    series!: Series;
}
