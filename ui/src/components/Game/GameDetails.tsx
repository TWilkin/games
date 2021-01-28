import React from 'react';
import { NavLink, RouteComponentProps, withRouter } from 'react-router-dom';

import { APIProps, APISettings } from '../common';
import GameImage from './GameImage';
import GameSummary from './GameSummary';
import { GameCollection, GamePlatform, GameWishlist } from '../../models';
import PlayTimeCounter from '../PlayTime/PlayTimeCounter';
import PlayTimeList from '../PlayTime/PlayTimeList';
import { useMutation, useQuery, useUpdatableQuery } from '../../hooks/graphql';
import { VariableType } from 'json-to-graphql-query';
import { RestrictedButton } from '../Admin/Restricted';

interface GameDetailsMatch {
    gamePlatformId: string;
}

interface GameDetailsProps extends APIProps, RouteComponentProps<GameDetailsMatch> { }

const GameDetails = ({ api, match }: GameDetailsProps): JSX.Element => {
    const gamePlatformId = parseInt(match.params.gamePlatformId);

    const { 
        gamePlatform,
        gameCollection,
        gameWishlist
    } = useGameDetails(api, gamePlatformId);

    const { onAddToCollectionClick, onAddToWishlistClick } = useGameList(
        api, 
        gamePlatformId, 
        gameCollection.setResults, 
        gameWishlist.setResults
    );

    return (
        <div className='panel'>
            {gamePlatform ? (
                <>
                    <h1 className='panel__heading'>
                        {gamePlatform?.alias ?? gamePlatform?.game.title}
                    </h1>

                    <GameImage api={api} game={gamePlatform?.game} />
                    <GameSummary gamePlatform={gamePlatform} />
                    
                    <div>
                        {gameCollection?.results?.length > 0 ? (
                            <>In collection</>
                        ) : (
                            <>
                                <button onClick={onAddToCollectionClick}>
                                    Add to Collection
                                </button>

                                {gameWishlist?.results?.length > 0 ? (
                                    <>In wishlist</>
                                ) : (
                                    <button onClick={onAddToWishlistClick}>
                                        Add to Wishlist
                                    </button>
                                )}
                            </>
                        )}

                        <RestrictedButton user={api.user}>
                            <NavLink to={`/games/${gamePlatform?.game?.gameId}/edit`}>Edit</NavLink>
                        </RestrictedButton>
                    </div>

                    <PlayTimeCounter 
                        api={api}
                        gamePlatform={gamePlatform} />
                    <PlayTimeList
                        api={api}
                        gamePlatform={gamePlatform} />
                </>
            ) : (
                <p>Game not found</p>
            )}
        </div>
    );
};

export default withRouter(GameDetails);

function useGameDetails(api: APISettings, gamePlatformId: number) {
    // load the gamePlatform
    const query = {
        query: {
            __variables: {
                gamePlatformId: 'Int'
            },
            GetGamePlatform: {
                __args: {
                    gamePlatformId: new VariableType('gamePlatformId')
                },
                gamePlatformId: true,
                alias: true,
                game: {
                    gameId: true,
                    title: true,
                    includes: {
                        gameCompilationId: true,
                        included: {
                            title: true
                        }
                    }
                },
                platform: {
                    name: true
                }
            }
        }
    };
    const args = { gamePlatformId };
    const gamePlatforms = useQuery<GamePlatform>(api, query, args);
    const gamePlatform = gamePlatforms && gamePlatforms.length >= 1 ? gamePlatforms[0] : undefined;

    const gamePlatformUserArgs = {
        gamePlatformId,
        userId: api.user?.userId
    };

    // check if this game in the user's collection
    const gameCollectionQuery = {
        query: {
            __variables: {
                gamePlatformId: 'Int',
                userId: 'Int'
            },
            GetGameCollection: {
                __args: {
                    gamePlatformId: new VariableType('gamePlatformId'),
                    userId: new VariableType('userId')
                },
                gameCollectionId: true
            }
        }
    };
    const gameCollection = useUpdatableQuery<GameCollection>(api, gameCollectionQuery, gamePlatformUserArgs);

    // check if this game in the user's wishlist
    const gameWishlistQuery = {
        query: {
            __variables: {
                gamePlatformId: 'Int',
                userId: 'Int'
            },
            GetGameWishlist: {
                __args: {
                    gamePlatformId: new VariableType('gamePlatformId'),
                    userId: new VariableType('userId')
                },
                gameWishlistId: true
            }
        }
    };
    const gameWishlist = useUpdatableQuery<GameWishlist>(api, gameWishlistQuery, gamePlatformUserArgs);

    return {
        gamePlatform,
        gameCollection,
        gameWishlist
    };
}

const useGameList = (
    api: APISettings,
    gamePlatformId: number, 
    setGameCollection: React.Dispatch<React.SetStateAction<GameCollection[]>>,
    setGameWishlist: React.Dispatch<React.SetStateAction<GameWishlist[]>>
) => {
    const addArgs = {
        input: { gamePlatformId }
    };

    const gameCollectionQuery = {
        mutation: {
            __variables: {
                input: 'GameCollectionInput!'
            },
            AddGameCollection: {
                __args: {
                    input: new VariableType('input')
                },
                gameCollectionId: true
            }
        }
    };
    const onAddToCollectionClick = useMutation(api, gameCollectionQuery, addArgs, setGameCollection);

    const gameWishlistQuery = {
        mutation: {
            __variables: {
                input: 'GameWishlistInput!'
            },
            AddGameWishlist: {
                __args: {
                    input: new VariableType('input')
                },
                gameWishlistId: true
            }
        }
    };
    const onAddToWishlistClick = useMutation(api, gameWishlistQuery, addArgs, setGameWishlist);

    return {
        onAddToCollectionClick,
        onAddToWishlistClick
    };
};
