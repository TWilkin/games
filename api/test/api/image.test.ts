import { expect } from 'chai';
import devnull from 'dev-null';
import fetchMock from 'fetch-mock';
import fs from 'fs';
import HttpStatus from 'http-status-codes';
import 'mocha';
import sinon from 'sinon';

import ImageController from '../../src/api/image';
import IGDBRequestBuilder from '../../src/services/igdb/builder';
import IGDBService from '../../src/services/igdb/igdb';
import { mockSequelize } from '../utility/mock';

const igdbService = new IGDBService();

const igdbImageUrlMatcher = /image\/.*\/10.jpg/;

describe('ImageController', () => {
    mockSequelize();

    afterEach(() => {
        fetchMock.restore();
        sinon.restore();
    });

    describe('getGame', () => {
        it('not cached', async () => {
            const subject = createSubject([{ image_id: 10 }]);

            const response = await subject.getGame(1);
            expect(response).to.match(/1.jpg$/);
            expect(fetchMock.called(igdbImageUrlMatcher)).to.be.true;
        });

        it('cached', async () => {
            const subject = createSubject([{ image_id: 10 }]);

            sinon.stub(fs, 'existsSync')
                .callsFake(() => true);
            
            const response = await subject.getGame(1);
            expect(response).to.match(/1.jpg$/);
            expect(fetchMock.called(igdbImageUrlMatcher)).to.be.false;
        });

        it('game does not exist', async () => {
            const subject = createSubject([{ image_id: 10 }]);

            const response = await subject.getGame(1000);
            expect(response).to.be.null;
            expect(fetchMock.called(igdbImageUrlMatcher)).to.be.false;
        });

        it('no IGDB id', async () => {
            const subject = createSubject([{ image_id: 10 }]);

            const response = await subject.getGame(2);
            expect(response).to.be.null;
            expect(fetchMock.called(igdbImageUrlMatcher)).to.be.false;
        });

        it('no cover art', async () => {
            const subject = createSubject([]);

            const response = await subject.getGame(1);
            expect(response).to.be.null;
            expect(fetchMock.called(igdbImageUrlMatcher)).to.be.false;
        });

        it('cover art not found', async () => {
            const subject = createSubject([{ image_id: 10 }], HttpStatus.NOT_FOUND);

            const response = await subject.getGame(1);
            expect(response).to.be.null;
            expect(fetchMock.called(igdbImageUrlMatcher)).to.be.true;
        });
    });
});

function createSubject(result: unknown[], image: Buffer | number=Buffer.from([])) {
    // return an empty binary buffer when it tries to return the image
    fetchMock.mock(igdbImageUrlMatcher, image);

    // write any files to /dev/null
    sinon.stub(fs, 'createWriteStream')
        .callsFake(() => devnull());

    // stub the method to return some data
    sinon.stub(igdbService, 'getCover')
        .callsFake(() => new IGDBRequestBuilder(async () => result));

    return ImageController.init(null, igdbService);
}
