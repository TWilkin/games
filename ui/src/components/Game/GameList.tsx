import React, { Component } from 'react';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';

import { APIProps } from '../common';
import GameSummary from '../Game/GameSummary';
import query, { queries } from '../../graphql';
import { GamePlatform } from '../../models';

interface GameListState {
    games?: GamePlatform[];
}

export default class GameList extends Component<APIProps, GameListState> {
    
    constructor(props: APIProps) {
        super(props);

        this.state = {
            games: undefined
        };
    }

    public async componentDidMount() {
        try {
            const data: GamePlatform[] = await query(this.props.api.url, queries['GamePlatform']);
            this.setState({
                games: data
            });
        } catch(error) {
            this.props.api.onError(error);
        }
    }

    public render() {
        return (
            <div className='games'>
                <h1>All Games</h1>
                {this.renderGames()}
            </div>
        )
    }

    private renderGames() {
        if(this.state.games) {
            return(
                <div>
                    {this.state.games.map(entry => {
                        return(
                            <div key={entry.gamePlatformId}>
                                <Link to={`/game/${entry.gamePlatformId}`}>
                                    <GameSummary gamePlatform={entry} />
                                </Link>
                            </div>
                        );
                    })}
                </div>
            );
        }

        return (
            <div>No games found</div>
        )
    }

};
