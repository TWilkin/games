import { AutoIncrement, Column, DataType, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { Queryable } from '../api/decorators';
import GamePlatform from './game_platform';
import GameSeries from './game_series';

@Table
export default class Game extends Model<Game> {

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
