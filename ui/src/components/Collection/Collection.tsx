import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { APIProps } from '../common';
import { queries } from '../../graphql';
import { GameList } from '../Game/GameList';

interface CollectionMatch {
    userId: string;
}

interface CollectionProps extends APIProps, RouteComponentProps<CollectionMatch> { }

interface CollectionState {
    userId: number;
}

class Collection extends Component<CollectionProps, CollectionState> {

    constructor(props: CollectionProps) {
        super(props);

        this.state = {
            userId: parseInt(this.props.match.params.userId)
        };
    }

    public render() {
        return (
            <div className='collection'>
                <h1>My Collection</h1>
                <GameList api={this.props.api} 
                    query={queries['GameCollection']}
                    args={{ userId: this.state.userId }} />
            </div>
        )
    }
}

export default withRouter(Collection);
