import React from 'react';
import { withRouter } from 'react-router-dom';

import { UserRouteProps } from '../common';
import { GameList } from '../Game/GameList';
import { GameWishlist } from '../../models';
import { VariableType } from 'json-to-graphql-query';

const Wishlist = ({ api, match }: UserRouteProps): JSX.Element => {
    return (
        <GameList<GameWishlist> api={api} 
            title='My Wishlist'
            query={{
                query: {
                    __variables: {
                        platformId: 'Int'
                    },
                    GetGameWishlist: {
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

export default withRouter(Wishlist);
