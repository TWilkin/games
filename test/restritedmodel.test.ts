import { expect } from 'chai';

import { AbstractRestrictedModel } from '../src/models/restrictedmodel';
import { mockContext } from './utility/mock';
import { GraphQLUpdateOptions } from '../src/api/graphql';

describe('Restricted Model', () => {

    it('checkAdmin success', () => {
        AbstractRestrictedModel.checkAdmin(null, mockContext('admin'));
    });

    it('checkAdminUpdate success', () => {
        const options: GraphQLUpdateOptions = { 
            where: {},
            context: mockContext('admin')
        };
        AbstractRestrictedModel.checkAdminUpdate(null, options);
    });

    it('checkAdmin fail', () => {
        expect(() => { AbstractRestrictedModel.checkAdmin(null, mockContext('user')); })
            .to.throw('Unauthorised');
    });

    it('checkAdminUpdate fail', () => {
        const options: GraphQLUpdateOptions = { 
            where: {},
            context: mockContext('user')
        };
        expect(() => { AbstractRestrictedModel.checkAdminUpdate(null, options); })
            .to.throw('Unauthorised');
    });

});
