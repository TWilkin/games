import { AutoIncrement, BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

import Game from './game';
import Series from './series';

@Table
export default class GameSeries extends Model<GameSeries> {

    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    gameSeriesId!: number;

    @ForeignKey(() => Game)
    @Column(DataType.INTEGER)
    gameId!: number;

    @BelongsTo(() => Game)
    game!: Game;

    @ForeignKey(() => Series)
    @Column(DataType.INTEGER)
    seriesId!: number;

    @BelongsTo(() => Series)
    series!: Series;
}
