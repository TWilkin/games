import { AutoIncrement, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table
export default class Platform extends Model<Platform> {

    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    platformId!: number;

    @Column(DataType.STRING)
    name!: string;
}
