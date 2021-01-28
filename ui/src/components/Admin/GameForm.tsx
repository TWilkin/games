import { VariableType } from 'json-to-graphql-query';
import React, { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { useMutation, useQuery } from '../../hooks/graphql';
import { Game } from '../../models';
import { APIProps, APISettings } from '../common';
import Restricted from './Restricted';

interface GameMatch {
    gameId: string;
}

interface GameFormProps extends APIProps, RouteComponentProps<GameMatch> { }

interface GameFormData {
    gameId: string;
    title: string;
}

interface GameInput {
    title: string
}

const GameForm = ({ api, match }: GameFormProps): JSX.Element => {
    const gameId = match.params.gameId ? parseInt(match.params.gameId) : -1;

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
                title: true
            }
        }
    };
    const args = { gameId };
    const games = useQuery<Game>(api, query, args);
    const game = games?.length === 1 ? games[0] : undefined;

    const { gameForm, onGameSubmit } = useGameForm(api, game);
    
    return (
        <Restricted user={api.user}>
            <div className='panel'>
                <h1 className='panel__heading'>Add Game</h1>

                <form className='form' onSubmit={onGameSubmit}>
                    <input 
                        type='hidden' 
                        name='gameId'
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

                    <div className='form__actions'>
                        <button type='submit'>
                            {gameId === -1 ? 'Add' : 'Update'}
                        </button>
                    </div>
                </form>
            </div>
        </Restricted>
    );
};

export default withRouter(GameForm);

function useGameForm(api: APISettings, game: Game | undefined) {
    const { register, handleSubmit, reset } = useForm<GameFormData>();

    useEffect(() => reset({
        gameId: game?.gameId?.toString() ?? '',
        title: game?.title ?? ''
    }), [game]);

    const { addGame, addArgs } = useGameAdd(api);
    const { updateGame, updateArgs } = useGameUpdate(api);

    const onSubmit = useCallback(
        (data: GameFormData) => {
            if(data.gameId !== '') {
                updateArgs.id = parseInt(data.gameId);
                updateArgs.input = {
                    title: data.title
                };

                updateGame();
            } else {
                addArgs.input = {
                    title: data.title
                };

                addGame();
            }
        },
        []
    );

    return {
        gameForm: register,
        onGameSubmit: handleSubmit(onSubmit)
    };
}

function useGameAdd(api: APISettings) {
    const query = {
        mutation: {
            __variables: {
                input: 'GameInput!'
            },
            AddGame: {
                __args: {
                    input: new VariableType('input')
                },
                gameId: true
            }
        }
    };
    const args = {
        input: { } as GameInput
    };
    
    const addGame = useMutation(api, query, args);

    return {
        addGame,
        addArgs: args
    };
}

function useGameUpdate(api: APISettings) {
    const query = {
        mutation: {
            __variables: {
                id: 'Int!',
                input: 'GameInput!'
            },
            UpdateGame: {
                __args: {
                    id: new VariableType('id'),
                    input: new VariableType('input')
                },
                gameId: true
            }
        }
    };
    const args = {
        id: -1,
        input: { } as GameInput
    };
    
    const updateGame = useMutation(api, query, args);

    return {
        updateGame,
        updateArgs: args
    };
}
