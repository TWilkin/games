import React from 'react';
import { withRouter } from 'react-router-dom';

import { UserRouteProps } from '../common';
import { queries } from '../../graphql';
import { GameList } from '../Game/GameList';
import { GameWishlist } from '../../models';

const Wishlist = ({ api, match }: UserRouteProps): JSX.Element => {
    return (
        <GameList<GameWishlist> api={api} 
            title='My Wishlist'
            query={queries['GameWishlist']}
            args={{ userId: parseInt(match.params.userId) }} />
    );
};

export default withRouter(Wishlist);
