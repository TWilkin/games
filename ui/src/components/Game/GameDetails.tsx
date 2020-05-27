import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { APIProps } from '../common';
import EditButton from '../Admin/EditButton';
import GameSummary from './GameSummary';
import query, { queries, mutate, mutations } from '../../graphql';
import { GameCollection, GameCompilation, GamePlatform } from '../../models';
import PlayTimeCounter from '../PlayTime/PlayTimeCounter';

interface GameDetailsMatch {
    gamePlatformId: string;
}

interface GameDetailsProps extends APIProps, RouteComponentProps<GameDetailsMatch> { }

interface GameDetailsState {
    gamePlatform?: GamePlatform;
    gameCollectionId?: number;
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
        let content: JSX.Element;

        if(this.state.gamePlatform) {
            content = (
                <div>
                    <GameSummary gamePlatform={this.state.gamePlatform} />
                    {this.renderInCollection()}
                    <PlayTimeCounter 
                        api={this.props.api}
                        gamePlatform={this.state.gamePlatform} />
                    <EditButton 
                        api={this.props.api}
                        type='game' 
                        id={this.state.gamePlatform.game.gameId} />
                </div>                
            );
        } else {
            content = <p>Game not found)</p>;
        };

        return (
            <div className='game'>{content}</div>
        );
    }

    private renderInCollection() {
        if(this.state.gameCollectionId) {
            return (
                <p>In Collection</p>
            )
        }

        return (
            <button onClick={this.onAddToCollectionClick}>
                Add to Collection
            </button>
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

            // check if this game in out collection
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
        } catch(error) {
            this.props.api.onError(error);
        }
    }

}

export default withRouter(GameDetails);
