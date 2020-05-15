import { AutoIncrement, Column, DataType, HasMany, PrimaryKey, Table } from 'sequelize-typescript';

import { Queryable } from '../api/decorators';
import GamePlatform from './game_platform.model';
import GameSeries from './game_series.model';
import { AbstractSortableModel } from './sortable';

@Table
export default class Game extends AbstractSortableModel<Game> {

    @Queryable
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    gameId!: number;

    @HasMany(() => GamePlatform)
    platforms!: GamePlatform[];

    @HasMany(() => GameSeries)
    series!: GameSeries[];
    
}
