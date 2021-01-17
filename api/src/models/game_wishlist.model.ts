import { AutoIncrement, BelongsTo, Column, DataType, ForeignKey, PrimaryKey, Table } from 'sequelize-typescript';

import { Queryable } from '../api/decorators';
import GamePlatform from './game_platform.model';
import { AbstractOwnableModel } from './ownablemodel';

@Table
export default class GameWishlist extends AbstractOwnableModel<GameWishlist> {

    @Queryable
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    gameWishlistId!: number;

    @Queryable
    @ForeignKey(() => GamePlatform)
    @Column(DataType.INTEGER)
    gamePlatformId!: number;

    @BelongsTo(() => GamePlatform)
    gamePlatform!: GamePlatform;

}
