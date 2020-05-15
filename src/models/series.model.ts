import { AutoIncrement, Column, DataType, PrimaryKey, Table } from 'sequelize-typescript';

import { Queryable, Sortable } from '../api/decorators';
import { AbstractRestrictedModel } from './restrictedmodel';

@Table
export default class Series extends AbstractRestrictedModel<Series> {

    @Queryable
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    seriesId!: number;

    @Queryable
    @Sortable
    @Column(DataType.STRING)
    title!: string;
    
}
