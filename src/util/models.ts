import { BeforeCreate, BelongsTo, Column, DataType, ForeignKey, Model } from 'sequelize-typescript';

import { Queryable, Secret } from '../api/decorators';
import { GraphQLContext } from '../api/graphql';
import User from '../models/user';

export abstract class AbstractOwnableModel<T extends Model<T>> extends Model<T> {

    @Queryable
    @Secret(true, false)
    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    userId!: number;

    @BelongsTo(() => User)
    owner!: User;

    @BeforeCreate
    public static addOwner<T extends AbstractOwnableModel<T>>(instance: T, context: GraphQLContext) {
        if(context && context.user) {
            // add the owner
            instance.userId = context.user.userId;
            return;
        }

        // not authorised
        throw new Error('Unauthorised');
    }

}
