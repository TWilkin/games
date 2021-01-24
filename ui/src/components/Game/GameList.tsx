import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { APIProps } from '../common';
import GameSummary from '../Game/GameSummary';
import query, { queries, Query } from '../../graphql';
import { Model, UserGamePlatform, } from '../../models';
import PlatformFilter from '../Platform/PlatformFilter';

interface GameListProps extends APIProps {
    query: Query;
    args?: any;
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

    public onPlatformSelect(platformId: number): void {
        this.load(platformId);
    }

    public render(): JSX.Element {
        return (
            <div className='games panel'>
                <h1 className='panel__heading'>All Games</h1>
                <PlatformFilter
                    api={this.props.api}
                    onSelect={this.onPlatformSelect} />
                {this.renderGames()}
            </div>
        );
    }

    private renderGames() {
        return(
            <div className='games-list'>
                {this.state.games ? (
                    <ul>
                        {this.state.games.map(entry => {
                            return(
                                <li key={entry.gamePlatform.gamePlatformId}>
                                    <Link to={`/game/${entry.gamePlatform.gamePlatformId}`}>
                                        <GameSummary gamePlatform={entry.gamePlatform} />
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p>No games found</p>
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

}

export class AllGameList extends Component<APIProps> {
    render(): JSX.Element {
        return (
            <div>
                <h1>All Games</h1>
                <GameList 
                    api={this.props.api} 
                    query={queries['GamePlatform']} />
            </div>
        );
    }
}
