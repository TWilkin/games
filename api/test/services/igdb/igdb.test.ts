import { expect } from 'chai';
import fetchMock, { MockRequest } from 'fetch-mock';

import IGDB from '../../../src/services/igdb/igdb';

const authMatcher = /oauth2/;

const subject = new IGDB();

const getTests = {
    'GetGames': {
        matcher: /\/games/,
        func: subject.getGames
    },
    'GetPlatforms': {
        matcher: /\/platforms/,
        func: subject.getPlatforms
    }
};

describe('IGDB', () => {
    describe('Auth', () => {
        afterEach(() => fetchMock.restore());

        it('Re-use token', async () => {
            fetchMock.mock(authMatcher, {
                access_token: 'token',
                expires_in: 24 * 60 * 60
            });

            // new token
            subject.clearToken()
            await subject.authenticate();
            expect(fetchMock.called(authMatcher)).to.be.true;

            // token is re-used
            fetchMock.resetHistory();
            await subject.authenticate();
            expect(fetchMock.called(authMatcher)).to.be.false;
        });

        it('Expired token', async () => {
            fetchMock.mock(authMatcher, {
                access_token: 'token',
                expires_in: -60
            });

            // new token
            subject.clearToken()
            await subject.authenticate();
            expect(fetchMock.called(authMatcher)).to.be.true;

            // expired token
            fetchMock.resetHistory();
            await subject.authenticate();
            expect(fetchMock.called(authMatcher)).to.be.true;
        })
    });

    describe('Get Tests', () => {
        before(() => fetchMock
            .mock(authMatcher, {
                access_token: 'token',
                expires_in: 24 * 60 * 60
            })
        );

        after(() => fetchMock.restore());

        Object.keys(getTests).forEach((key) => {
            it(key, async () => {
                const params = getTests[key];
                fetchMock.mock(params.matcher, [{ id: 1 }, { id: 2 }]);

                let response = await params.func();

                expect(fetchMock.called(params.matcher)).to.be.true;
            });
        });
    });
});
