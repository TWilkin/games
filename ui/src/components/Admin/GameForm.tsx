import { VariableType } from 'json-to-graphql-query';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { generateAddOrUpdateQuery } from '../../graphql';
import { useMutation, useQuery } from '../../hooks/graphql';
import { Game, IGDBGame } from '../../models';
import { APIProps, APISettings } from '../common';
import GamePlatformForm, { GamePlatformFormData, useGamePlatformForm } from './GamePlatformForm';
import IGDBSearchForm from './IGDBSeachForm';
import { Restricted } from './Restricted';

interface GameMatch {
    gameId: string;
}

interface GameFormProps extends APIProps, RouteComponentProps<GameMatch> { }

interface GameFormData extends GamePlatformFormData {
    gameId: string;
    igdbId: string;
    title: string;
}

interface GameInput {
    title: string
    igdbId: number;
}

const GameForm = ({ api, match }: GameFormProps): JSX.Element => {
    const gameId = match.params.gameId ? parseInt(match.params.gameId) : -1;
    const method = gameId === -1 ? 'Add' : 'Update';

    const query = {
        query: {
            __variables: {
                gameId: 'Int'
            },
            GetGame: {
                __args: {
                    gameId: new VariableType('gameId')
                },
                gameId: true,
                igdbId: true,
                title: true
            }
        }
    };
    const args = { gameId };
    const games = useQuery<Game>(api, query, args);
    const game = games?.length === 1 ? games[0] : undefined;

    const { gameForm, gameFormSetValue, onGameSubmit } = useGameForm(api, game, gameId !== -1);

    const [ igdbGame, setIGDBGame ] = useState<IGDBGame>(undefined);
    useEffect(() => {
        if(igdbGame) {
            gameFormSetValue('igdbId', igdbGame.id);
            gameFormSetValue('title', igdbGame.name, {
                shouldDirty: true
            });
        }
    }, [igdbGame]);
    
    return (
        <div className='panel'>
            <h1 className='panel__heading'>
                {`${method} Game`}
            </h1>
            
            <Restricted user={api.user}>
                <IGDBSearchForm api={api} 
                    game={game}
                    onGameSelect={setIGDBGame} />
                <hr />

                <form className='form' onSubmit={onGameSubmit}>
                    <input 
                        type='hidden' 
                        name='gameId'
                        ref={gameForm} />
                    <input 
                        type='hidden' 
                        name='igdbId'
                        ref={gameForm} />

                    <div className='field'>
                        <div className='field__label'>
                            <label htmlFor='gameTitle'>Title:</label>
                        </div>
                        <div className='field__input'>
                            <input 
                                type='text'
                                name='title'
                                id='gameTitle'
                                ref={gameForm} />
                        </div>
                    </div>

                    <GamePlatformForm 
                        api={api} 
                        form={gameForm} 
                        setValue={gameFormSetValue}
                        game={game} />

                    <div className='form__actions'>
                        <button type='submit'>
                            {method}
                        </button>
                    </div>
                </form>
            </Restricted>
        </div>
    );
};

export default withRouter(GameForm);

function useGameForm(api: APISettings, game: Game | undefined, edit: boolean) {
    const { register, handleSubmit, reset, setValue, getValues } = useForm<GameFormData>();

    // set default form values if editing
    useEffect(() => reset({
        gameId: game?.gameId?.toString() ?? '',
        igdbId: game?.igdbId?.toString() ?? '',
        title: game?.title ?? ''
    }), [game]);

    // construct the query
    const { query, args } = generateAddOrUpdateQuery<GameInput>(
        edit,
        'Game',
        { gameId: true }
    );

    const submitGame = useMutation<Game>(api, query, args);

    const submitGamePlatforms = useGamePlatformForm(api);

    const onSubmit = useCallback(
        async (data: GameFormData) => {
            if(edit) {
                args.id = parseInt(data.gameId);
            }

            args.input = {
                title: data.title,
                igdbId: data.igdbId ? parseInt(data.igdbId) : undefined
            };

            const game = await submitGame();

            submitGamePlatforms(game.gameId, data);
        },
        []
    );

    return {
        gameForm: register,
        gameFormSetValue: setValue,
        onGameSubmit: handleSubmit(onSubmit)
    };
}
