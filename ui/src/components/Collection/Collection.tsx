import React from 'react';
import { withRouter } from 'react-router-dom';

import { UserRouteProps } from '../common';
import { queries } from '../../graphql';
import { GameList } from '../Game/GameList';
import { GameCollection } from '../../models';

const Collection = ({ api, match }: UserRouteProps): JSX.Element => {
    return (
        <GameList<GameCollection> api={api}
            title='My Collection'
            query={queries['GameCollection']}
            args={{ userId: parseInt(match.params.userId) }} />
    );
};

export default withRouter(Collection);
