import { AutoIncrement, Column, DataType, PrimaryKey, Table } from 'sequelize-typescript';

import { Queryable } from '../api/decorators';
import { AbstractRestrictedModel } from '../util/models';

@Table
export default class Series extends AbstractRestrictedModel<Series> {

    @Queryable
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    seriesId!: number;

    @Queryable
    @Column(DataType.STRING)
    title!: string;
    
}
