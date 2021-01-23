import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { APIProps, APISettings } from '../common';
import GameImage from './GameImage';
import GameSummary from './GameSummary';
import { mutations, queries } from '../../graphql';
import { GameCollection, GamePlatform, GamePlayTime, GameWishlist } from '../../models';
import PlayTimeCounter from '../PlayTime/PlayTimeCounter';
import PlayTimeList from '../PlayTime/PlayTimeList';
import { useMutation, useQuery } from '../../hooks/graphql';

interface GameDetailsMatch {
    gamePlatformId: string;
}

interface GameDetailsProps extends APIProps, RouteComponentProps<GameDetailsMatch> { }

const GameDetails = ({ api, match }: GameDetailsProps): JSX.Element => {
    const gamePlatformId = parseInt(match.params.gamePlatformId);

    const { 
        gamePlatform,
        playtime,
        gameCollection,
        gameWishlist
    } = useGameDetails(api, gamePlatformId);

    const addArgs = {
        input: { gamePlatformId }
    };
    const onAddToCollectionClick = useMutation(api, mutations['add']['GameCollection'], addArgs);
    const onAddToWishlistClick = useMutation(api, mutations['add']['GameWishlist'], addArgs);

    return (
        <div className='game'>
            {gamePlatform ? (
                <div>
                    <GameImage api={api} game={gamePlatform?.game} />
                    <GameSummary gamePlatform={gamePlatform} />
                    
                    <div>
                        {gameCollection?.length > 0 ? (
                            <>In collection</>
                        ) : (
                            <>
                                <button onClick={onAddToCollectionClick}>
                                    Add to Collection
                                </button>

                                {gameWishlist?.length > 0 ? (
                                    <>In wishlist</>
                                ) : (
                                    <button onClick={onAddToWishlistClick}>
                                        Add to Wishlist
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    <PlayTimeCounter 
                        api={api}
                        gamePlatform={gamePlatform} />
                    <PlayTimeList playTime={playtime} />
                </div>
            ) : (
                <>Game not found</>
            )}
        </div>
    );
};

export default withRouter(GameDetails);

function useGameDetails(api: APISettings, gamePlatformId: number) {
    // load the gamePlatform
    const args = { gamePlatformId };
    const gamePlatforms = useQuery<GamePlatform>(api, queries['GamePlatform'], args);
    const gamePlatform = gamePlatforms && gamePlatforms.length >= 1 ? gamePlatforms[0] : undefined;

    // check if this game in the user's collection or wishlist
    const collectionWishlistArgs = {
        gamePlatformId,
        userId: api.user?.userId
    };
    const gameCollection = useQuery<GameCollection>(api, queries['GameCollection'], collectionWishlistArgs);
    const gameWishlist = useQuery<GameWishlist>(api, queries['GameWishlist'], collectionWishlistArgs);

    // load the playtime
    const playtimeArgs = {
        gamePlatformId,
        userId: api.user?.userId
    };
    const playtime = useQuery<GamePlayTime>(api, queries['GamePlayTime'], playtimeArgs);

    return {
        gamePlatform,
        playtime,
        gameCollection,
        gameWishlist
    };
}
