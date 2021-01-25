import React from 'react';
import { withRouter } from 'react-router-dom';

import { UserRouteProps } from '../common';
import { queries } from '../../graphql';
import { GameList } from '../Game/GameList';
import { GameCollection } from '../../models';

const Collection = ({ api, match }: UserRouteProps): JSX.Element => {
    return (
        <div className='collection'>
            <h1>My Collection</h1>
            <GameList<GameCollection> api={api} 
                query={queries['GameCollection']}
                args={{ userId: parseInt(match.params.userId) }} />
        </div>
    );
};

export default withRouter(Collection);
