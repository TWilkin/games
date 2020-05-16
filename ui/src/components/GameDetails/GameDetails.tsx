import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { APIProps } from '../common';
import query, { queries } from '../../graphql';
import { Game } from '../../models';

interface GameDetailsMatch {
    gameId: string;
}

interface GameDetailsProps extends APIProps, RouteComponentProps<GameDetailsMatch> { }

interface GameDetailsState {
    game?: Game;
}

class GameDetails extends Component<GameDetailsProps, GameDetailsState> {

    constructor(props: GameDetailsProps) {
        super(props);

        this.state = {
            game: undefined
        };
    }

    public componentDidMount() {
        const gameId = parseInt(this.props.match.params.gameId);
        this.loadGame(gameId);
    }

    public componentDidUpdate() {
        // if the id has changed, load the new data
        const gameId = parseInt(this.props.match.params.gameId);
        if(this.state.game && this.state.game.gameId != gameId) {
            this.loadGame(gameId);
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

    private async loadGame(gameId: number) {
        try {
            const args = { gameId: gameId };
            const data: Game[] = await query(this.props.apiUrl, queries['GameDetails'], args);
            this.setState({
                game: data && data.length >= 1 ? data[0] : undefined
            });
        } catch(error) {
            this.props.onError(error);
        }
    }

}

export default withRouter(GameDetails);
