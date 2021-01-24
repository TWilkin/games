import React from 'react';
import { withRouter } from 'react-router-dom';

import { UserRouteProps } from '../common';
import { queries } from '../../graphql';
import { GameList } from '../Game/GameList';
import { GameWishlist } from '../../models';

const Wishlist = ({ api, match }: UserRouteProps): JSX.Element => {
    return (
        <div className='wishlist'>
            <h1>My Wishlist</h1>
            <GameList<GameWishlist> api={api} 
                query={queries['GameWishlist']}
                args={{ userId: parseInt(match.params.userId) }} />
        </div>
    );
};

export default withRouter(Wishlist);
