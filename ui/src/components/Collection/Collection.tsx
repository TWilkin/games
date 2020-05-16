import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { APIProps } from '../common';
import query, { queries } from '../../graphql';
import { GameCollection } from '../../models';

interface CollectionState {
    collection?: GameCollection[];
}

export default class Collection extends Component<APIProps, CollectionState> {
    
    constructor(props: APIProps) {
        super(props);

        this.state = {
            collection: undefined
        };
    }

    public componentDidMount() {
        this.load();
    }

    public render() {
        return (
            <div className='collection'>
                {this.renderCollection()}
            </div>
        )
    }

    private renderCollection() {
        if(this.state.collection) {
            return(
                <div>
                    {this.state.collection.map(entry => {
                        return(
                            <div key={entry.gameCollectionId}>
                                <strong>Title:</strong>
                                <Link to={`/game/${entry.gamePlatform.game.gameId}`}>
                                    {entry.gamePlatform.game.title}
                                </Link>
                                <br />

                                <strong>Platform:</strong>
                                {entry.gamePlatform.platform.name}
                                <br />
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

    private async load() {
        try {
            const data: GameCollection[] = await query(this.props.apiUrl, queries['MyCollection']);
            this.setState({
                collection: data
            });
        } catch(error) {
            this.props.onError(error);
        }
    }

};
