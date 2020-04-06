import { AutoIncrement, Column, DataType, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';

import GameCollection from './game_collection';

@Table
export default class User extends Model<User> {

    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    userId!: number;

    @Column(DataType.STRING)
    userName!: string;

    @HasMany(() => GameCollection)
    games!: GameCollection[];
}
