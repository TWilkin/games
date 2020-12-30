import React, { Component } from 'react';
import { withRouter, NavLink, RouteComponentProps } from 'react-router-dom';

import { APIProps } from '../common';
import GameSummary from '../Game/GameSummary';
import query, { queries } from '../../graphql';
import { GameCollection } from '../../models';

interface CollectionMatch {
    userId: string;
}

interface CollectionProps extends APIProps, RouteComponentProps<CollectionMatch> { }

interface CollectionState {
    userId?: number;
    collection?: GameCollection[];
}

class Collection extends Component<CollectionProps, CollectionState> {
    
    constructor(props: CollectionProps) {
        super(props);

        this.state = {
            collection: undefined
        };
    }

    public componentDidMount() {
        const userId = parseInt(this.props.match.params.userId);
        this.load(userId);
    }

    public componentDidUpdate() {
        // if the id has changed, load the new data
        const userId = parseInt(this.props.match.params.userId);
        if(this.state.userId != userId) {
            this.load(userId);
        }
    }

    public render() {
        return (
            <div className='collection'>
                <h1>My Collection</h1>
                {this.renderCollection()}
            </div>
        )
    }

    private renderCollection() {
        return (
            <div>
                {this.state.collection ? (
                    <>
                        {this.state.collection.map(entry => (
                            <div key={entry.gameCollectionId}>
                                <NavLink to={`/game/${entry.gamePlatform.gamePlatformId}`}>
                                    <GameSummary gamePlatform={entry.gamePlatform} />
                                </NavLink>
                            </div>
                        ))}
                    </>
                ) : (
                    <>No games found</>
                )}
            </div>
        );
    }

    private async load(userId: number) {
        try {
            const args = {
                userId: userId
            };
            const data: GameCollection[] = await query(this.props.api.url, queries['GameCollection'], args);
            this.setState({
                userId: userId,
                collection: data
            });
        } catch(error) {
            this.props.api.onError(error);
        }
    }

}

export default withRouter(Collection);
