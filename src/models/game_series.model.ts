import { AutoIncrement, BelongsTo, Column, DataType, ForeignKey, PrimaryKey, Table } from 'sequelize-typescript';

import { Queryable } from '../api/decorators';
import Game from './game.model';
import Series from './series.model';
import { AbstractRestrictedModel } from './restrictedmodel';

@Table
export default class GameSeries extends AbstractRestrictedModel<GameSeries> {

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
