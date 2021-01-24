import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { APIProps } from '../common';
import GameSummary from '../Game/GameSummary';
import { queries, Query } from '../../graphql';
import { GamePlatform, Model, UserGamePlatform, } from '../../models';
import PlatformFilter from '../Platform/PlatformFilter';
import { useQuery } from '../../hooks/graphql';

interface GameListProps extends APIProps {
    query: Query;
    args?: Record<string, any>;
}

export function GameList<TCollection extends Model>({ api, query, args }: GameListProps): JSX.Element {
    const [platformId, setPlatformId] = useState(-1);

    const queryArgs = {
        ...args,
        platformId
    };
    const games = useQuery<TCollection>(api, query, queryArgs);

    return (
        <div className='games'>
            <PlatformFilter
                api={api}
                onSelect={setPlatformId} />
            <br />
            
            <div>
                {games?.length > 0 ? (
                    <>
                        {toUserGamePlatform(games).map(entry => {
                            return(
                                <div key={entry.gamePlatform.gamePlatformId}>
                                    <Link to={`/game/${entry.gamePlatform.gamePlatformId}`}>
                                        <GameSummary gamePlatform={entry.gamePlatform} />
                                    </Link>
                                </div>
                            );
                        })}
                    </>
                ) : (
                    <>No games found</>
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
        <div>
            <h1>All Games</h1>
            <GameList<GamePlatform> 
                api={api} 
                query={queries['GamePlatform']} />
        </div>
    );
};
