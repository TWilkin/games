import { BeforeCreate, BeforeUpdate, Model } from 'sequelize-typescript';

import { GraphQLContext, GraphQLUpdateOptions } from '../api/graphql';

// model that prevents insert/update from anyone apart from an admin
export abstract class AbstractRestrictedModel<T extends Model<T>> extends Model<T> {

    @BeforeCreate
    public static checkAdmin(_, context: GraphQLContext): void {
        // confirm the user is an admin
        if(context.user?.role === 'admin') {
            return;
        }

        throw new Error('Forbidden');
    }

    @BeforeUpdate
    public static checkAdminUpdate(_, options: GraphQLUpdateOptions): void {
        AbstractRestrictedModel.checkAdmin(_, options.context);
    }

}
