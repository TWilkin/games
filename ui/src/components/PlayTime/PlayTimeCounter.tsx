import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';

import { mutations, queries } from '../../graphql';
import { useMutation, useUpdatableQuery } from '../../hooks/graphql';
import { GamePlatform, GamePlayTime } from '../../models';
import { APIProps, APISettings } from '../common';
import ModalDialog from '../ModalDialog/ModalDialog';
import Timer from './Timer';

interface PlayTimeCounterProps extends APIProps {
    gamePlatform: GamePlatform;
}

interface StartCounterFormData {
    gameCompilationId: string;
    demo: boolean;
}

interface GamePlayTimeInput {
    gamePlatformId?: number;
    gameCompilationId?: number;
    demo?: boolean;
    startTime?: number;
    endTime?: number;
}

const PlayTimeCounter = ({ api, gamePlatform}: PlayTimeCounterProps): JSX.Element => {
    const args = {
        gamePlatformId: gamePlatform.gamePlatformId,
        userId: api.user?.userId,
        endTime: null as Date
    };
    const playTime = useUpdatableQuery<GamePlayTime>(api, queries['GamePlayTime'], args);

    const [ startCounterDialogVisible, setStartCounterDialogVisible ] = useState(false);

    const { startCounterForm, onStartCounterSubmit } = useStartCounterForm(
        api,
        gamePlatform,
        () => setStartCounterDialogVisible(false),
        playTime.setResults
    );

    const onStopCounterSubmit = useStopCounter(
        api, 
        gamePlatform, 
        playTime.setResults
    );

    return (
        <div className='playTimeCounter'>
            {playTime.results?.length > 0 ? (
                <>
                    <Timer startTime={playTime.results[0].startTime} />
                    {' '}
                    <button type='button' onClick={() => onStopCounterSubmit(playTime.results[0])}>
                        Stop Play Counter
                    </button>
                </>
            ) : (
                <button type='button' onClick={() => setStartCounterDialogVisible(true)}>
                    Start Play Counter
                </button>
            )}

            {startCounterDialogVisible && (
                <form onSubmit={onStartCounterSubmit}>
                    <ModalDialog
                        submit='Start'
                        cancel='Cancel'
                        form={startCounterForm}
                        onClose={() => setStartCounterDialogVisible(false)}
                    >
                        {gamePlatform.game.includes?.length > 0 && (
                            <>
                                <select 
                                    name='gameCompilationId'
                                    defaultValue={-1}
                                    ref={startCounterForm}
                                >
                                    <option key={-1} value={-1}>-</option>
                                    {gamePlatform.game.includes.map(compilation => {
                                        return (
                                            <option 
                                                key={compilation.gameCompilationId} 
                                                value={compilation.gameCompilationId}>
                                                {compilation.included.title}
                                            </option>
                                        );
                                    })}
                                </select>
                                <br />
                            </>
                        )}

                        <label>Demo? 
                            <input 
                                type='checkbox'
                                name='demo' 
                                ref={startCounterForm}  />
                        </label>
                    </ModalDialog>
                </form>
            )}
        </div>
    );
};

export default PlayTimeCounter;

function useStartCounterForm(
    api: APISettings,
    gamePlatform: GamePlatform, 
    onFormSubmit: () => void,
    setPlayTime: React.Dispatch<React.SetStateAction<GamePlayTime[]>>
) {
    const { register, handleSubmit } = useForm<StartCounterFormData>();

    const args = {
        input: { } as GamePlayTimeInput
    };

    const addPlayTime = useMutation(api, mutations['add']['GamePlayTime'], args, setPlayTime);

    const onSubmit = useCallback(
        (data: StartCounterFormData) => {
            onFormSubmit();
            
            args.input = {
                gamePlatformId: gamePlatform.gamePlatformId,
                gameCompilationId: data.gameCompilationId === '-1' 
                    ? undefined : parseInt(data.gameCompilationId),
                demo: data.demo,
                startTime: Date.now()
            };

            addPlayTime();
        },
        []
    );

    return {
        startCounterForm: register,
        onStartCounterSubmit: handleSubmit(onSubmit)
    };
}

function useStopCounter(
    api: APISettings,
    gamePlatform: GamePlatform,
    setPlayTime: React.Dispatch<React.SetStateAction<GamePlayTime[]>>
) {
    const args = {
        id: -1,
        input: { } as GamePlayTimeInput
    };

    const updatePlayTime = useMutation(api, mutations['update']['GamePlayTime'], args);

    return useCallback(
        (playTime: GamePlayTime) => {
            args.input = {
                gamePlatformId: gamePlatform.gamePlatformId,
                gameCompilationId: playTime.gameCompilationId,
                demo: playTime.demo,
                startTime: playTime.startTime,
                endTime: Date.now()
            };
            args.id = playTime.gamePlayTimeId;

            updatePlayTime();
            setPlayTime(undefined);
        },
        []
    );
}
