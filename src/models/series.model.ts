import { AutoIncrement, Column, DataType, PrimaryKey, Table } from 'sequelize-typescript';

import { Queryable } from '../api/decorators';
import { AbstractSortableModel } from './sortable';

@Table
export default class Series extends AbstractSortableModel<Series> {

    @Queryable
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    seriesId!: number;
    
}
