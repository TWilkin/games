import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { APIProps } from '../common';
import query, { queries } from '../../graphql';
import { GamePlatform } from '../../models';

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
        return (
            <div>
                {this.renderGame()}
            </div>
        );
    }

    private renderGame() {
        if(this.state.gamePlatform) {
            return (
                <div className='game'>
                    <strong>Title: </strong>
                    {this.state.gamePlatform.game.title}
                </div>
            );
        }

        return (
            <div className='game'>Game not found</div>
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
