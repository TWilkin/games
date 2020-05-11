import { BeforeCreate, BeforeUpdate, Model } from 'sequelize-typescript';

import { GraphQLContext, GraphQLUpdateOptions } from '../api/graphql';

// model that prevents insert/update from anyone apart from an admin
export abstract class AbstractRestrictedModel<T extends Model<T>> extends Model<T> {

    @BeforeCreate
    public static checkAdmin(_, context: GraphQLContext) {
        // confirm the user is an admin
        if(context.user && context.user.isAdmin) {
            return;
        }

        // not authorised
        throw new Error('Unauthorised');
    }

    @BeforeUpdate
    public static checkAdminUpdate(_, options: GraphQLUpdateOptions) {
        AbstractRestrictedModel.checkAdmin(_, options.context);
    }

}
