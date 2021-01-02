import { expect } from 'chai';

import { mockContext, mockSequelize } from '../utility/mock';

import { GraphQLUpdateOptions } from '../../src/api/graphql';
import { AbstractOwnableModel } from '../../src/models/ownablemodel';
import GameCollection from '../../src/models/game_collection.model';

describe('Ownable Model', () => {

    mockSequelize();

    it('addOwner success', () => {
        const instance = new GameCollection();
        instance.userId = 0;
        AbstractOwnableModel.addOwner(instance, mockContext('user', 2));
        expect(instance.userId).is.equal(2);
    });

    it('checkOwner success', async () => {
        const instance = new GameCollection();
        instance.gameCollectionId = 2;
        const options: GraphQLUpdateOptions = { 
            where: {},
            context: mockContext('user', 2)
        };
        await AbstractOwnableModel.checkOwner(instance, options);
    });

    it('checkOwner fail', () => {
        const instance = new GameCollection();
        instance.gameCollectionId = 1;
        const options: GraphQLUpdateOptions = { 
            where: {},
            context: mockContext('user', 2)
        };
        expect(AbstractOwnableModel.checkOwner(instance, options))
            .to.eventually.be.rejectedWith('Unauthorised');
    });

});
