import React from 'react';

import { Game } from '../../models';
import { APIProps } from '../common';

interface GameImageProps extends APIProps {
    game: Game;
}

const GameImage = ({ api, game }: GameImageProps): JSX.Element => {
    return (
        <img src={`${api.url}/images/games/${game.gameId}`}
            alt={`Cover art for ${game.title}`} />
    );
};

export default GameImage;
