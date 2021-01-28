import { VariableType } from 'json-to-graphql-query';
import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '../../hooks/graphql';

import { APIProps, APISettings } from '../common';
import Restricted from './Restricted';

interface GameFormData {
    title: string;
}

const GameForm = ({ api }: APIProps): JSX.Element => {
    const { gameForm, onGameSubmit } = useGameForm(api);
    
    return (
        <Restricted user={api.user}>
            <div className='panel'>
                <h1 className='panel__heading'>Add Game</h1>

                <form className='form' onSubmit={onGameSubmit}>
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
                        <button type='submit'>Add</button>
                    </div>
                </form>
            </div>
        </Restricted>
    );
};

export default GameForm;

function useGameForm(api: APISettings) {
    const { register, handleSubmit } = useForm<GameFormData>();

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
        input: { } as GameFormData
    };
    const addGame = useMutation(api, query, args);

    const onSubmit = useCallback(
        (data: GameFormData) => {
            args.input = {
                title: data.title
            };

            addGame();
        },
        []
    );

    return {
        gameForm: register,
        onGameSubmit: handleSubmit(onSubmit)
    };
}
