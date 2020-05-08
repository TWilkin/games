import { BeforeCreate, BelongsTo, Column, DataType, ForeignKey, Model } from 'sequelize-typescript';

import { Queryable } from '../api/decorators';
import { GraphQLContext } from '../api/graphql';
import User from '../models/user';

export abstract class AbstractOwnableModel<T extends Model<T>> extends Model<T> {

    @Queryable
    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    userId!: number;

    @BelongsTo(() => User)
    owner!: User;

    @BeforeCreate
    public static authoriseCreate<T extends AbstractOwnableModel<T>>(instance: T, context: GraphQLContext) {
        if(context && context.user) {
            // check if the user is an admin
            if(context.user.isAdmin) {
                return;
            }

            // check if this user owns this element
            if(context.user.userId == instance.userId) {
                return;
            }
        }

        // not authorised
        throw new Error('Forbidden');
    }

}
