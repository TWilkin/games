import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { VariableType } from 'json-to-graphql-query';
import React from 'react';
import Moment from 'react-moment';
import { useQuery } from '../../hooks/graphql';

import { GamePlatform, GamePlayTime } from '../../models';
import { APIProps } from '../common';
import SortableTable from '../SortableTable/SortableTable';

interface PlayTimeListProps extends APIProps {
    gamePlatform: GamePlatform;
}

const PlayTimeList = ({ api, gamePlatform }: PlayTimeListProps): JSX.Element => {
    const query = {
        query: {
            __variables: {
                gamePlatformId: 'Int',
                userId: 'Int'
            },
            GetGamePlayTime: {
                __args: {
                    gamePlatformId: new VariableType('gamePlatformId'),
                    userId: new VariableType('userId')
                },
                demo: true,
                endTime: true,
                startTime: true
            }
        }
    };
    const args = {
        gamePlatformId: gamePlatform.gamePlatformId,
        userId: api.user?.userId
    };
    const playTime = useQuery<GamePlayTime>(api, query, args);

    const renderCells = (playTime: GamePlayTime): JSX.Element[] => {
        return playTime?.endTime && (
            [
                <Moment key='startTime' date={playTime.startTime} format='L LT' />,
                <Moment key='endTime' date={playTime.endTime} format='L LT' />,
                <Moment key='duration' duration={playTime.startTime} date={playTime.endTime} format='hh:mm:ss' />,
                playTime.demo ? <FontAwesomeIcon key='isDemo' icon={faCheckCircle} /> : null
            ]
        );
    };
    
    return (
        <div className='playTime'>
            {playTime?.length > 0 ? (
                <SortableTable<GamePlayTime>
                    title='Play Time'
                    headings={['Start', 'End', 'For', 'Demo']}
                    sortColumns={['startTime', 'endTime', null, 'demo']}
                    data={playTime}
                    row={renderCells}
                />
            ) : null}
        </div>
    );
};

export default PlayTimeList;
