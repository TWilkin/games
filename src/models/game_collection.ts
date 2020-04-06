import { AutoIncrement, BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

import GamePlatform from './game_platform';
import User from './user';

@Table
export default class GameCollection extends Model<GameCollection> {

    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    gameCollectionId!: number;

    @ForeignKey(() => GamePlatform)
    @Column(DataType.INTEGER)
    gamePlatformId!: number;

    @BelongsTo(() => GamePlatform)
    gamePlatform!: GamePlatform;

    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    userId!: number;

    @BelongsTo(() => User)
    owner!: User;
}
