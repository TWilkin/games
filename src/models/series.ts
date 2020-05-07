import { AutoIncrement, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { Queryable } from '../api/decorators';

@Table
export default class Series extends Model<Series> {

    @Queryable
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    seriesId!: number;

    @Queryable
    @Column(DataType.STRING)
    title!: string;
}
