import React, { Component } from 'react';
import { Game } from '../../models';

import { APIProps } from '../common';

interface GameImageProps extends APIProps {
    game: Game;
}

export default class GameImage extends Component<GameImageProps> {
    render() {
        return (
            <img src={`${this.props.api.url}/images/games/${this.props.game.gameId}`}
                alt={`Cover art for ${this.props.game.title}`} />
        )
    }
};
