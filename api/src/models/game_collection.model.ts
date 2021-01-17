import { AutoIncrement, BelongsTo, Column, DataType, ForeignKey, PrimaryKey, Table } from 'sequelize-typescript';

import { NestedQueryable, Queryable } from '../api/decorators';
import GamePlatform from './game_platform.model';
import { AbstractOwnableModel } from './ownablemodel';

@Table
export default class GameCollection extends AbstractOwnableModel<GameCollection> {

    @Queryable
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    gameCollectionId!: number;

    @Queryable
    @NestedQueryable('platformId')
    @ForeignKey(() => GamePlatform)
    @Column(DataType.INTEGER)
    gamePlatformId!: number;

    @BelongsTo(() => GamePlatform)
    gamePlatform!: GamePlatform;

}
