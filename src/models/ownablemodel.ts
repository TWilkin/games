import { BeforeCreate, BeforeUpdate, BelongsTo, Column, DataType, ForeignKey, Model } from 'sequelize-typescript';

import { Queryable, Secret } from '../api/decorators';
import { GraphQLContext, GraphQLUpdateOptions } from '../api/graphql';
import User from './user.model';

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

    @BeforeUpdate
    public static async checkOwner<T extends AbstractOwnableModel<T>>(instance: T, options: GraphQLUpdateOptions) {
        const context = options.context;
        if(context && context.user) {
            // check this is being updated by the owner
            const model = context.database.models[instance.constructor.name];
            const existing = await model.findByPk(instance[model.primaryKeyAttribute]);
            if(existing && (existing as AbstractOwnableModel<T>).userId == context.user.userId) {
                return;
            }
        }

        // not authorised
        throw new Error('Unauthorised');
    }

}
