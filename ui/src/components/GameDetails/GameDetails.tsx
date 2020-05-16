import React, { Component } from 'react';

import { APIProps } from '../common';
import query, { queries } from '../../graphql';

interface GameState {
    game?: {
        title: string
    }
}

export default class Game extends Component<APIProps, GameState> {

    constructor(props: APIProps) {
        super(props);

        this.state = {
            game: null
        };
    }

    public async componentDidMount() {
        try {
            const data = await query(this.props.apiUrl, queries['GameDetails']);
            this.setState({
                game: data && data.length > 1 ? data[0] : undefined
            });
        } catch(error) {
            this.props.onError(error);
        }
    }

    public render() {
        return (
            <div>
                {this.renderGame()}
            </div>
        );
    }

    private renderGame() {
        if(this.state.game) {
            return (
                <div className='game'>
                    <strong>Title: </strong>
                    {this.state.game.title}
                </div>
            );
        }

        return (
            <div className='game'>Game not found</div>
        );
    }

}
