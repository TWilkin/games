import { VariableType } from 'json-to-graphql-query';
import React, { useEffect, useState } from 'react';
import { generateAddOrUpdateQuery } from '../../graphql';
import { useMutation, useQuery } from '../../hooks/graphql';
import { Game, GamePlatform, Platform } from '../../models';

import { APIProps, APISettings } from '../common';
import PlatformFilter from '../Platform/PlatformFilter';

interface GamePlatformFormProps extends APIProps {
    form: any;
    setValue: any;
    game?: Game;
}

interface GamePlatformInput {
    gameId: number;
    platformId: number;
    alias?: string;
}

export interface GamePlatformFormData {
    gamePlatforms: {
        gamePlatformId?: string;
        platformId: string;
        alias?: string;
    }[];
}

const GamePlatformForm = ({ api, form, setValue, game }: GamePlatformFormProps): JSX.Element => {
    const [ platforms, setPlatforms ] = useState<Platform[]>(undefined);

    const query = {
        query: {
            __variables: {
                gameId: 'Int'
            },
            GetGamePlatform: {
                __args: {
                    gameId: new VariableType('gameId')
                },
                gamePlatformId: true,
                alias: true,
                platform: {
                    platformId: true,
                    name: true
                }
            }
        }
    };
    const args = { gameId: game?.gameId ?? -1 };
    const gamePlatforms = useQuery<GamePlatform>(api, query, args);
    
    // update selected platforms
    useEffect(
        () => setPlatforms(gamePlatforms?.map(gamePlatform => gamePlatform.platform)),
        [gamePlatforms]
    );

    // update selected platform aliases
    useEffect(
        () => gamePlatforms?.forEach(gamePlatform => {
            setValue(
                `gamePlatforms[${gamePlatform.platform.platformId}]`,
                {
                    gamePlatformId: gamePlatform.gamePlatformId,
                    platformId: gamePlatform.platform.platformId,
                    alias: gamePlatform.alias
                },
                {
                    shouldDirty: true
                }
            );
        }),
        [platforms]
    );

    return (
        <>
            <div className='field'>
                <div className='field__label'>
                    <label htmlFor='gamePlatforms'>Platforms:</label>
                </div>
                <div className='field__input'>
                    <PlatformFilter
                        api={api}
                        multi={true}
                        selected={platforms?.map(platform => platform.platformId)}
                        onSelect={setPlatforms} />
                </div>
            </div>

            {platforms?.map(platform => {
                const name = `gamePlatforms[${platform.platformId}]`;
                const gamePlatformIdName = `${name}.gamePlatformId`;
                const aliasName = `${name}.alias`;
                const platformIdName = `${name}.platformId`;

                return (
                    <div className='field' key={platform.platformId}>
                        <input type='hidden'
                            name={gamePlatformIdName}
                            ref={form} />

                        <input type='hidden'
                            name={platformIdName}
                            ref={form}
                            defaultValue={platform.platformId} />
                        
                        <div className='field__label'>
                            <label htmlFor={aliasName}>
                                {`${platform.name} Alias:`}
                            </label>
                        </div>
                        <div className='field__input'>
                            <input
                                type='text'
                                name={aliasName}
                                id={aliasName}
                                ref={form} />
                        </div>
                    </div>
                );
            })}
        </>
    );
};

export default GamePlatformForm;

export function useGamePlatformForm(api: APISettings)
    : (gameId: number, data: GamePlatformFormData) => Promise<GamePlatform[]>
{
    const add = generateAddOrUpdateQuery<GamePlatformInput>(
        false,
        'GamePlatform',
        { 
            gamePlatformId: true,
            alias: true
        }
    );
    const addGamePlatform = useMutation<GamePlatform>(api, add.query, add.args);

    const update = generateAddOrUpdateQuery<GamePlatformInput>(
        true,
        'GamePlatform',
        { 
            gamePlatformId: true,
            alias: true
        }
    );
    const updateGamePlatform = useMutation<GamePlatform>(api, update.query, update.args);

    return async (gameId: number, data: GamePlatformFormData) => {
        return await Promise.all(
            data.gamePlatforms
                ?.map(async (gamePlatform) => {
                    if(!gamePlatform.gamePlatformId?.isNullOrWhitespace()) {
                        // use update
                        update.args.id = gamePlatform.gamePlatformId
                            ? parseInt(gamePlatform?.gamePlatformId)
                            : undefined;
                    
                        update.args.input = {
                            gameId: gameId,
                            platformId: parseInt(gamePlatform.platformId),
                            alias: gamePlatform.alias || gamePlatform.alias !== ''
                                ? gamePlatform.alias : undefined
                        };

                        return await updateGamePlatform();
                    }

                    // use add
                    add.args.input = {
                        gameId: gameId,
                        platformId: parseInt(gamePlatform.platformId),
                        alias: gamePlatform.alias || gamePlatform.alias !== ''
                            ? gamePlatform.alias : undefined
                    };

                    return await addGamePlatform();
                })
        );
    };
}
