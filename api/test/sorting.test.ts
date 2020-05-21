import { expect } from 'chai';
import { Model } from 'sequelize-typescript';

import Game from '../src/models/game.model';
import GamePlatform from '../src/models/game_platform.model';
import sortBy, { convertSortValue } from '../src/models/sortable';

// the list of games to test
const games = [
    ['A Bug\'s Life', 'BUGS LIFE, A'],
    ['The Elder Scrolls V: Skyrim', 'ELDER SCROLLS 0000000005 SKYRIM, THE'],
    ['Final Fantasy VIII', 'FINAL FANTASY 0000000008'],
    ['Final Fantasy IX', 'FINAL FANTASY 0000000009'],
    ['The Legend of Zelda', 'LEGEND OF ZELDA, THE'],
    ['Metal Gear Ac!d', 'METAL GEAR ACD'],
    ['Ōkami', 'OKAMI'],
    ['Sonic & Knuckles', 'SONIC AND KNUCKLES'],
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
        const data = games.map(test => {
            const game = new Game();
            game.title = test[0];
            return game;
        });
        const sorted = shuffleAndSort(data, 'title');
        
        // test the sorting returned the original order
        sorted.forEach((game, index) => expect(game.title).to.equal(games[index][0]));
    });

    it('sortBy in join', () => {
        const data = games.map(test => {
            const platform = new GamePlatform();
            platform.game = new Game();
            platform.game.title = test[0];
            return platform;
        });
        const sorted = shuffleAndSort(data, 'game.title');

        // test the sorting returned the original order
        sorted.forEach((platform, index) => expect(platform.game.title).to.equal(games[index][0]));
    });

});

function shuffleAndSort<T extends Model<T>>(data: T[], column: string) {
    // shuffle the data
    for(let i = 0; i < data.length; i++) {
        const j = Math.floor(Math.random() * i);
        [data[i], data[j]] = [data[j], data[i]];
    }

    // sort the data by the sort column
    return data.sort(sortBy(column));
}
