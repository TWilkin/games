import React from 'react';
import { withRouter } from 'react-router-dom';

import { UserRouteProps } from '../common';
import { GameList } from '../Game/GameList';
import { GameCollection } from '../../models';
import { VariableType } from 'json-to-graphql-query';

const Collection = ({ api, match }: UserRouteProps): JSX.Element => {
    return (
        <GameList<GameCollection> api={api}
            title='My Collection'
            query={{
                query: {
                    __variables: {
                        platformId: 'Int'
                    },
                    GetGameCollection: {
                        __args: {
                            platformId: new VariableType('platformId'),
                            userId: parseInt(match.params.userId)
                        },
                        gamePlatform: {
                            gamePlatformId: true,
                            alias: true,
                            game: {
                                title: true
                            },
                            platform: {
                                name: true
                            }
                        }
                    }
                }
            }} />
    );
};

export default withRouter(Collection);
