import { BelongsTo, Column, DataType, ForeignKey, Model } from 'sequelize-typescript';

import { Queryable } from '../api/decorators';
import User from '../models/user';

export abstract class AbstractOwnableModel<T extends Model<T>> extends Model<T> {

    @Queryable
    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    userId!: number;

    @BelongsTo(() => User)
    owner!: User;

}
