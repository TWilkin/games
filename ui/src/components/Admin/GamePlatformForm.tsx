import React, { useState } from 'react';
import { generateAddOrUpdateQuery } from '../../graphql';
import { useMutation } from '../../hooks/graphql';
import { Platform } from '../../models';

import { APIProps, APISettings } from '../common';
import PlatformFilter from '../Platform/PlatformFilter';

interface GamePlatformFormProps extends APIProps {
    form: any;
}

interface GamePlatformInput {
    gameId: number;
    platformId: number;
    alias?: string;
}

export interface GamePlatformFormData {
    gamePlatforms: {
        platformId: string;
        alias?: string;
    }[];
}

const GamePlatformForm = ({ api, form }: GamePlatformFormProps): JSX.Element => {
    const [ platforms, setPlatforms ] = useState<Platform[]>(undefined);

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
                        onSelect={setPlatforms} />
                </div>
            </div>

            {platforms?.map((platform, index) => {
                const name = `gamePlatforms[${index}]`;
                const aliasName = `${name}.alias`;
                const platformIdName = `${name}.platformId`;
                
                return (
                    <div className='field' key={platform.platformId}>
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

export function useGamePlatformForm(api: APISettings, edit: boolean)
    : (gameId: number, data: GamePlatformFormData) => Promise<void>
{
    const { query, args } = generateAddOrUpdateQuery<GamePlatformInput>(
        edit,
        'GamePlatform',
        { gamePlatformId: true }
    );

    const submitGamePlatform = useMutation(api, query, args);

    return async (gameId: number, data: GamePlatformFormData) => {
        alert(JSON.stringify(data));
        await Promise.all(
            data.gamePlatforms?.map(async (gamePlatform) => {
                args.input = {
                    gameId: gameId,
                    platformId: parseInt(gamePlatform.platformId),
                    alias: gamePlatform.alias || gamePlatform.alias !== ''
                        ? gamePlatform.alias : undefined
                };

                await submitGamePlatform();
            })
        );
    };
}
