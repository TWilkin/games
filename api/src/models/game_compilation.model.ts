import { AutoIncrement, BelongsTo, Column, DataType, ForeignKey, PrimaryKey, Table } from 'sequelize-typescript';

import { Queryable } from '../api/decorators';
import Game from './game.model';
import { AbstractRestrictedModel } from './restrictedmodel';

@Table
export default class GameCompilation extends AbstractRestrictedModel<GameCompilation> {

    @Queryable
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    gameCompilationId!: number;

    @Queryable
    @ForeignKey(() => Game)
    @Column(DataType.INTEGER)
    gameId!: number;

    @BelongsTo(() => Game, 'gameId')
    game!: Game;

    @Queryable
    @ForeignKey(() => Game)
    @Column(DataType.INTEGER)
    includedGameId!: number;

    @BelongsTo(() => Game, 'includedGameId')
    included!: Game;

}
