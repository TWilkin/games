import { AutoIncrement, Column, DataType, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';

import GamePlatform from './game_platform';

@Table
export default class Game extends Model<Game> {

    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    gameId!: number;

    @Column(DataType.STRING)
    title!: string;

    @HasMany(() => GamePlatform)
    platforms!: GamePlatform[];
}
