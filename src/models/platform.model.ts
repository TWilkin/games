import { AutoIncrement, Column, DataType, PrimaryKey, Table } from 'sequelize-typescript';

import { Queryable, Sortable } from '../api/decorators';
import { AbstractRestrictedModel } from './restrictedmodel';

@Table
export default class Platform extends AbstractRestrictedModel<Platform> {

    @Queryable
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    platformId!: number;

    @Queryable
    @Sortable
    @Column(DataType.STRING)
    name!: string;
    
}
