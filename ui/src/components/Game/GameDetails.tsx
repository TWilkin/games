import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { APIProps } from '../common';
import GameImage from './GameImage';
import GameSummary from './GameSummary';
import query, { queries, mutate, mutations, Query } from '../../graphql';
import { GameCollection, GameCompilation, GamePlatform, GamePlayTime, GameWishlist, UserGamePlatform } from '../../models';
import PlayTimeCounter from '../PlayTime/PlayTimeCounter';
import PlayTimeList from '../PlayTime/PlayTimeList';

interface GameDetailsMatch {
    gamePlatformId: string;
}

interface GameDetailsProps extends APIProps, RouteComponentProps<GameDetailsMatch> { }

interface GameDetailsState {
    gamePlatform?: GamePlatform;
    gameCollectionId?: number;
    gameWishlistId?: number;
    gamePlayTime?: GamePlayTime[];
}

class GameDetails extends Component<GameDetailsProps, GameDetailsState> {

    constructor(props: GameDetailsProps) {
        super(props);

        this.state = {
            gamePlatform: undefined,
            gameCollectionId: undefined,
            gameWishlistId: undefined
        };

        this.onAddToCollectionClick = this.onAddToCollectionClick.bind(this);
        this.onAddToWishlistClick = this.onAddToWishlistClick.bind(this);
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

    private async onAddToWishlistClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();

        // add to the user's wishlist
        try {
            const args = {
                input: {
                    gamePlatformId: this.state.gamePlatform.gamePlatformId
                }
            };
            const data: GameWishlist = await mutate(this.props.api.url, mutations['add']['GameWishlist'], args);
            if(data) {
                this.setState({
                    gameWishlistId: data.gameWishlistId
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
                        <GameImage api={this.props.api} game={this.state.gamePlatform?.game} />
                        <GameSummary gamePlatform={this.state.gamePlatform} />
                        {this.renderInCollectionOrWishlist()}
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

    private renderInCollectionOrWishlist() {
        return (
            <div>
                {this.state.gameCollectionId ? (
                    <>In collection</>
                ) : (
                    <>
                        <button onClick={this.onAddToCollectionClick}>
                            Add to Collection
                        </button>

                        {this.state.gameWishlistId ? (
                            <>In wishlist</>
                        ) : (
                            <button onClick={this.onAddToWishlistClick}>
                                Add to Wishlist
                            </button>
                        )}
                    </>
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

            // check if this game in the user's collection or wishlist
            let gameCollection = await this.loadUserGamePlatform<GameCollection>(game, queries['GameCollection']);
            let gameWishlist = await this.loadUserGamePlatform<GameWishlist>(game, queries['GameWishlist']);
            this.setState({
                gameCollectionId: gameCollection?.gameCollectionId,
                gameWishlistId: gameWishlist?.gameWishlistId
            });        

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

    private async loadUserGamePlatform<TGamePlatform extends UserGamePlatform>(game: GamePlatform, graphQLQuery: Query) {
        if(game) {
            const args = {
                gamePlatformId: game.gamePlatformId,
                userId: this.props.api.user.userId
            };
            const data = await query(this.props.api.url, graphQLQuery, args);
            if(data && data.length >= 1) {
                return data[0] as unknown as TGamePlatform;
            }
        }
    }

}

export default withRouter(GameDetails);
