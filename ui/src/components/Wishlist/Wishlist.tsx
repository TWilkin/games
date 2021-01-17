import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { APIProps } from '../common';
import { queries } from '../../graphql';
import { GameList } from '../Game/GameList';

interface WishlistMatch {
    userId: string;
}

interface WishlistProps extends APIProps, RouteComponentProps<WishlistMatch> { }

interface WishlistState {
    userId: number;
}

class Wishlist extends Component<WishlistProps, WishlistState> {

    constructor(props: WishlistProps) {
        super(props);

        this.state = {
            userId: parseInt(this.props.match.params.userId)
        };
    }

    public render() {
        return (
            <div className='wishlist'>
                <h1>My Wishlist</h1>
                <GameList api={this.props.api} 
                    query={queries['GameWishlist']}
                    args={{ userId: this.state.userId }} />
            </div>
        )
    }
}

export default withRouter(Wishlist);
