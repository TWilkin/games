import { AutoIncrement, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { Queryable } from '../api/queryable';

@Table
export default class Platform extends Model<Platform> {

    @Queryable
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    platformId!: number;

    @Queryable
    @Column(DataType.STRING)
    name!: string;
}
