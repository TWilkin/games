import React from 'react';

import { Game } from '../../models';
import { APIProps } from '../common';

interface GameImageProps extends APIProps {
    game: Game;
}

const GameImage = ({ api, game }: GameImageProps): JSX.Element => {
    return (
        <div className='game-image'>
            <div className='game-image__inner'>
                <img src={`${api.url}/images/games/${game.gameId}`}
                    alt={`Cover art for ${game.title}`} />
            </div>
        </div>
    );
};

export default GameImage;
