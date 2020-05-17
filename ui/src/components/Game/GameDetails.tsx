import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { APIProps } from '../common';
import GameSummary from './GameSummary';
import query, { queries } from '../../graphql';
import { GamePlatform } from '../../models';
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
                        apiUrl={this.props.apiUrl}
                        onError={this.props.onError}
                        gamePlatformId={this.state.gamePlatform.gamePlatformId} />
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
            const args = { gamePlatformId: gamePlatformId };
            const data: GamePlatform[] = await query(this.props.apiUrl, queries['GamePlatform'], args);
            this.setState({
                gamePlatform: data && data.length >= 1 ? data[0] : undefined
            });
        } catch(error) {
            this.props.onError(error);
        }
    }

}

export default withRouter(GameDetails);
