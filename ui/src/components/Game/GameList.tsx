import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { APIProps } from '../common';
import GameSummary from '../Game/GameSummary';
import { GraphQLQuery } from '../../graphql';
import { GamePlatform, Model, UserGamePlatform, } from '../../models';
import PlatformFilter from '../Platform/PlatformFilter';
import { useQuery } from '../../hooks/graphql';
import { VariableType } from 'json-to-graphql-query';

interface GameListProps extends APIProps {
    title: string;
    query: GraphQLQuery;
}

export function GameList<TCollection extends Model>({ api, title, query }: GameListProps): JSX.Element {
    const [platformId, setPlatformId] = useState(-1);

    const args = {
        platformId
    };
    const games = useQuery<TCollection>(api, query, args);

    return (
        <div className='games panel'>
            <h1 className='panel__heading'>{title}</h1>

            <PlatformFilter
                api={api}
                onSelect={setPlatformId} />

            <div className='games-list'>
                {games?.length > 0 ? (
                    <ul>
                        {toUserGamePlatform(games).map(entry => {
                            return(
                                <li key={entry.gamePlatform.gamePlatformId}>
                                    <Link to={`/games/${entry.gamePlatform.gamePlatformId}`}>
                                        <GameSummary gamePlatform={entry.gamePlatform} />
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p>No games found</p>
                )}
            </div>
        </div>
    );
}

function toUserGamePlatform(data: Model[]) {
    if(data.length == 0) {
        return [] as UserGamePlatform[];
    }

    if('gameCollectionId' in data[0]
        || 'gameWishlistId' in data[0])
    {
        return data as unknown as UserGamePlatform[];
    }

    return data.map(gamePlatform => ({
        gamePlatform
    } as UserGamePlatform));
}

export const AllGameList = ({ api }: APIProps): JSX.Element => {
    return (
        <GameList<GamePlatform> 
            title='All Games'
            api={api} 
            query={{
                query: {
                    __variables: {
                        platformId: 'Int'
                    },
                    GetGamePlatform: {
                        __args: {
                            platformId: new VariableType('platformId')
                        },
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
            }} />
    );
};
