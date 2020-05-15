import { AutoIncrement, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table
export default class Series extends Model<Series> {

    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    seriesId!: number;

    @Column(DataType.STRING)
    title!: string;
}
