import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { APIProps } from '../common';
import GameSummary from './GameSummary';
import query, { queries } from '../../graphql';
import { GameCompilation, GamePlatform } from '../../models';
import PlayTimeCounter from '../PlayTime/PlayTimeCounter';

interface GameDetailsMatch {
    gamePlatformId: string;
}

interface GameDetailsProps extends APIProps, RouteComponentProps<GameDetailsMatch> { }

interface GameDetailsState {
    gamePlatform?: GamePlatform;
}

class GameDetails extends Component<GameDetailsProps, GameDetailsState> {

    constructor(props: GameDetailsProps) {
        super(props);

        this.state = {
            gamePlatform: undefined
        };
    }

    public componentDidMount() {
        const gamePlatformId = parseInt(this.props.match.params.gamePlatformId);
        this.load(gamePlatformId);
    }

    public componentDidUpdate() {
        // if the id has changed, load the new data
        const gamePlatformId = parseInt(this.props.match.params.gamePlatformId);
        if(this.state.gamePlatform && this.state.gamePlatform.gamePlatformId != gamePlatformId) {
            this.load(gamePlatformId);
        }
    }

    public render() {
        let content: JSX.Element;

        if(this.state.gamePlatform) {
            content = (
                <div>
                    <GameSummary gamePlatform={this.state.gamePlatform} />
                    <PlayTimeCounter 
                        api={this.props.api}
                        gamePlatform={this.state.gamePlatform} />
                </div>                
            );
        } else {
            content = <p>Game not found)</p>;
        };

        return (
            <div className='game'>{content}</div>
        );
    }

    private async load(gamePlatformId: number) {
        try {
            // load the gamePlatform
            let args: object = { gamePlatformId: gamePlatformId };
            const games: GamePlatform[] = await query(this.props.api.url, queries['GamePlatform'], args);

            // load the compilations (if any)
            if(games && games.length >= 1) {
                args = { primaryGameId: games[0].game.gameId };
                const compilations: GameCompilation[] = await query(this.props.api.url, queries['GameCompilation'], args);
                games[0].game.includes = compilations;
            }

            // store the game
            this.setState({
                gamePlatform: games && games.length >= 1 ? games[0] : undefined
            });
        } catch(error) {
            this.props.api.onError(error);
        }
    }

}

export default withRouter(GameDetails);
