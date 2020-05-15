import { expect } from 'chai';

import Game from '../src/models/game.model';
import sortBy, { convertSortValue } from '../src/models/sortable';

// the list of games to test
const games = [
    ['A Bug\'s Life', 'BUGS LIFE, A'],
    ['The Elder Scrolls V: Skyrim', 'ELDER SCROLLS 0000000005 SKYRIM, THE'],
    ['Final Fantasy VIII', 'FINAL FANTASY 0000000008'],
    ['Final Fantasy IX', 'FINAL FANTASY 0000000009'],
    ['The Legend of Zelda', 'LEGEND OF ZELDA, THE'],
    ['Metal Gear Ac!d', 'METAL GEAR ACD'],
    ['WipeOut 2097', 'WIPEOUT 0000002097']
]

describe('Sorting', () => {

    describe('convertSortValue', () => {
        games.forEach(test => {
            it(`${test[0]} == ${test[1]}`, () => {
                expect(convertSortValue(test[0])).to.equal(test[1]);
            });
        });
    });

    it('sortBy', () => {
        // shuffle the array
        const shuffled = games.map(test => {
            const game = new Game();
            game.title = test[0];
            return game;
        });
        for(let i = 0; i < shuffled.length; i++) {
            const j = Math.floor(Math.random() * i);
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // test the sorting returned the original order
        const sorted = shuffled.sort(sortBy('title'));
        sorted.forEach((game, index) => expect(game.title).to.equal(games[index][0]));
    });

});
