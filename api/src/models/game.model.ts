import { AutoIncrement, Column, DataType, HasMany, PrimaryKey, Table } from 'sequelize-typescript';

import { Queryable, Sortable } from '../api/decorators';
import GameCompilation from './game_compilation.model';
import GamePlatform from './game_platform.model';
import GameSeries from './game_series.model';
import { AbstractRestrictedModel } from './restrictedmodel';

@Table
export default class Game extends AbstractRestrictedModel<Game> {

    @Queryable
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    gameId!: number;

    @Queryable
    @Sortable
    @Column(DataType.STRING)
    title!: string;

    @HasMany(() => GamePlatform)
    platforms!: GamePlatform[];

    @HasMany(() => GameSeries)
    series!: GameSeries[];

    @HasMany(() => GameCompilation, 'primaryGameId')
    includes!: GameCompilation[];

    @HasMany(() => GameCompilation, 'includedGameId')
    includedIn!: GameCompilation[];
    
}
