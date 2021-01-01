import { expect } from 'chai';
import fetchMock, { MockRequest } from 'fetch-mock';

import IGDB from '../../../src/services/igdb/igdb';

const service = new IGDB();

const getTests = {
    'GetGames': {
        matcher: /\/games/,
        func: service.getGames
    },
    'GetPlatforms': {
        matcher: /\/platforms/,
        func: service.getPlatforms
    }
};

describe('IGDB', () => {
    before(() => fetchMock
        .mock(/oauth2/, {
            access_token: 'token',
            expires_in: 1000
        })
    );

    after(() => fetchMock.restore());

    Object.keys(getTests).forEach((key) => {
        it(key, async () => {
            const params = getTests[key];
            fetchMock.mock(params.matcher, [{ id: 1 }, { id: 2 }]);

            let response = await params.func();

            expect(fetchMock.called(/oauth2/)).to.be.true;
            expect(fetchMock.called(params.matcher)).to.be.true;
        });
    });
});
