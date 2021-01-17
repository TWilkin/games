import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { APIProps } from '../common';
import GameSummary from '../Game/GameSummary';
import query, { queries, Query } from '../../graphql';
import { Model, UserGamePlatform, } from '../../models';
import PlatformFilter from '../Platform/PlatformFilter';

interface GameListProps extends APIProps {
    query: Query;
    args?: object;
}

interface GameListState {
    games?: UserGamePlatform[];
}

export class GameList extends Component<GameListProps, GameListState> {
    
    constructor(props: GameListProps) {
        super(props);

        this.state = {
            games: undefined
        };

        this.onPlatformSelect = this.onPlatformSelect.bind(this);
    }

    public onPlatformSelect(platformId: number) {
        this.load(platformId);
    }

    public render() {
        return (
            <div className='games'>
                <PlatformFilter
                    api={this.props.api}
                    onSelect={this.onPlatformSelect} />
                <br />
                {this.renderGames()}
            </div>
        )
    }

    private renderGames() {
        return(
            <div>
                {this.state.games ? (
                    <>
                        {this.state.games.map(entry => {
                            return(
                                <div key={entry.gamePlatform.gamePlatformId}>
                                    <Link to={`/game/${entry.gamePlatform.gamePlatformId}`}>
                                        <GameSummary gamePlatform={entry.gamePlatform} />
                                    </Link>
                                </div>
                            );
                        })}
                    </>
                ) : (
                    <>No games found</>
                )}
            </div>
        );
    }

    private async load(platformId: number) {
        try {
            const args = {
                ...this.props.args,
                platformId: platformId
            };
            const data = await query(this.props.api.url, this.props.query, args);
            this.setState({
                games: this.toUserGamePlatform(data)
            });
        } catch(error) {
            this.props.api.onError(error);
        }
    }

    private toUserGamePlatform(data: Model[]) {
        if(data.length == 0) {
            return [] as UserGamePlatform[];
        }

        if('gameCollectionId' in data[0]
            || 'gameWishlistId' in data[0])
        {
            return data as unknown as UserGamePlatform[];
        }

        return data.map(gamePlatform => ({
            gamePlatform
        } as UserGamePlatform));
    }

};

export class AllGameList extends Component<APIProps> {
    render() {
        return (
            <div>
                <h1>All Games</h1>
                <GameList 
                    api={this.props.api} 
                    query={queries['GamePlatform']} />
            </div>
        )
    }
};
