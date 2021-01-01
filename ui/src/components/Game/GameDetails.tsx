import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { APIProps } from '../common';
import GameSummary from './GameSummary';
import query, { queries, mutate, mutations } from '../../graphql';
import { GameCollection, GameCompilation, GamePlatform, GamePlayTime } from '../../models';
import PlayTimeCounter from '../PlayTime/PlayTimeCounter';
import PlayTimeList from '../PlayTime/PlayTimeList';

interface GameDetailsMatch {
    gamePlatformId: string;
}

interface GameDetailsProps extends APIProps, RouteComponentProps<GameDetailsMatch> { }

interface GameDetailsState {
    gamePlatform?: GamePlatform;
    gameCollectionId?: number;
    gamePlayTime?: GamePlayTime[];
}

class GameDetails extends Component<GameDetailsProps, GameDetailsState> {

    constructor(props: GameDetailsProps) {
        super(props);

        this.state = {
            gamePlatform: undefined,
            gameCollectionId: undefined
        };

        this.onAddToCollectionClick = this.onAddToCollectionClick.bind(this);
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

    private async onAddToCollectionClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();

        // add to the user's collection
        try {
            const args = {
                input: {
                    gamePlatformId: this.state.gamePlatform.gamePlatformId
                }
            };
            const data: GameCollection = await mutate(this.props.api.url, mutations['add']['GameCollection'], args);
            if(data) {
                this.setState({
                    gameCollectionId: data.gameCollectionId
                });
            }
        } catch(error) {
            this.props.api.onError(error);
        }
    }

    public render() {
        return (
            <div className='game'>
                {this.state.gamePlatform ? (
                    <div>
                        <GameSummary gamePlatform={this.state.gamePlatform} />
                        {this.renderInCollection()}
                        <PlayTimeCounter 
                            api={this.props.api}
                            gamePlatform={this.state.gamePlatform} />
                        <PlayTimeList playTime={this.state.gamePlayTime} />
                    </div>
                ) : (
                    <>Game not found</>
                )}
            </div>
        );
    }

    private renderInCollection() {
        return (
            <div>
                {this.state.gameCollectionId ? (
                    <>In collection</>
                ) : (
                    <button onClick={this.onAddToCollectionClick}>
                        Add to Collection
                    </button>
                )}
            </div>
        );
    }

    private async load(gamePlatformId: number) {
        try {
            // load the gamePlatform
            let args: object = { gamePlatformId: gamePlatformId };
            const games: GamePlatform[] = await query(this.props.api.url, queries['GamePlatform'], args);
            const game = games && games.length >= 1 ? games[0] : undefined;

            // load the compilations (if any)
            if(game) {
                args = { primaryGameId: games[0].game.gameId };
                const compilations: GameCompilation[] = await query(this.props.api.url, queries['GameCompilation'], args);
                games[0].game.includes = compilations;
            }

            // store the game
            this.setState({
                gamePlatform: game
            });

            // check if this game in the user's collection
            if(game) {
                args = {
                    gamePlatformId: gamePlatformId,
                    userId: this.props.api.user.userId
                };
                const collection: GameCollection[] = await query(this.props.api.url, queries['GameCollection'], args);
                if(collection && collection.length >= 1) {
                    this.setState({
                        gameCollectionId: collection[0].gameCollectionId
                    });
                }
            }

            // load the playtime
            if(game) {
                args = {
                    gamePlatformId: gamePlatformId,
                    userId: this.props.api.user.userId
                };

                const playtime: GamePlayTime[] = await query(this.props.api.url, queries['GamePlayTime'], args);

                if(playtime?.length >= 1) {
                    this.setState({
                        gamePlayTime: playtime
                    });
                }
            }
        } catch(error) {
            this.props.api.onError(error);
        }
    }

}

export default withRouter(GameDetails);
