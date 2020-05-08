import { AutoIncrement, Column, DataType, HasMany, PrimaryKey, Table } from 'sequelize-typescript';

import { Queryable } from '../api/decorators';
import GamePlatform from './game_platform';
import GameSeries from './game_series';
import { AbstractRestrictedModel } from '../util/models';

@Table
export default class Game extends AbstractRestrictedModel<Game> {

    @Queryable
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    gameId!: number;

    @Queryable
    @Column(DataType.STRING)
    title!: string;

    @HasMany(() => GamePlatform)
    platforms!: GamePlatform[];

    @HasMany(() => GameSeries)
    series!: GameSeries[];
    
}
