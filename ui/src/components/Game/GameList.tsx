import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { APIProps } from '../common';
import GameSummary from '../Game/GameSummary';
import query, { queries } from '../../graphql';
import { GamePlatform } from '../../models';
import PlatformFilter from '../Platform/PlatformFilter';

interface GameListState {
    games?: GamePlatform[];
}

export default class GameList extends Component<APIProps, GameListState> {
    
    constructor(props: APIProps) {
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
                <h1>All Games</h1>
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
                                <div key={entry.gamePlatformId}>
                                    <Link to={`/game/${entry.gamePlatformId}`}>
                                        <GameSummary gamePlatform={entry} />
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
                platformId: platformId
            };
            const data: GamePlatform[] = await query(this.props.api.url, queries['GamePlatform'], args);
            this.setState({
                games: data
            });
        } catch(error) {
            this.props.api.onError(error);
        }
    }

};
