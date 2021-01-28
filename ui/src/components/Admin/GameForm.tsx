import { VariableType } from 'json-to-graphql-query';
import React, { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { GraphQLQuery } from '../../graphql';
import { useMutation, useQuery } from '../../hooks/graphql';
import { Game } from '../../models';
import { APIProps, APISettings } from '../common';
import { Restricted } from './Restricted';

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

    const { gameForm, onGameSubmit } = useGameForm(api, game, gameId !== -1);
    
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

function useGameForm(api: APISettings, game: Game | undefined, edit: boolean) {
    const { register, handleSubmit, reset } = useForm<GameFormData>();

    // set default form values if editing
    useEffect(() => reset({
        gameId: game?.gameId?.toString() ?? '',
        title: game?.title ?? ''
    }), [game]);

    // construct the query
    const queryName = edit ? 'UpdateGame' : 'AddGame';

    const query = {
        mutation: {
            __variables: {
                input: 'GameInput!'
            }
        }
    } as GraphQLQuery;
    query.mutation[queryName] = {
        __args: {
            input: new VariableType('input')
        },
        gameId: true
    };

    const args = {
        id: undefined as number | undefined,
        input: { } as GameInput
    };

    if(edit) {
        query.mutation.__variables.id = 'Int!';
        query.mutation[queryName].__args.id = new VariableType('id');
    }

    const submitGame = useMutation(api, query, args);

    const onSubmit = useCallback(
        (data: GameFormData) => {
            if(edit) {
                args.id = parseInt(data.gameId);
            }

            args.input = {
                title: data.title
            };

            submitGame();
        },
        []
    );

    return {
        gameForm: register,
        onGameSubmit: handleSubmit(onSubmit)
    };
}