import { expect } from 'chai';
import { plainToClass } from 'class-transformer';

import { loadData, mockSequelize } from './utility/mock';
import User from '../src/models/user.model';

describe('User model', () => {
    let users: User[];

    before(async () => {
        users = (await loadData())
            .filter(entry => entry.model == 'User')
            .map(entry => entry.data)[0]
            .map(data => plainToClass(User, data));
    });

    mockSequelize();

    it('User authenticate with valid credentials', async () => {
        const user = users[0];
        const result = await User.authenticate(user.userName, 'password');
        expect(result).to.be.not.null;
        expect(result?.userId).to.equal(user.userId);
        expect(result?.userName).to.equal(user.userName);
        expect(result?.password).to.equal(user.password);
        expect(result?.role).to.equal(user.role);
    });

    it('User authenticate with invalid credentials', async () => {
        const result = await User.authenticate(users[0].userName, 'a');
        expect(result).to.be.null;
    });

});
