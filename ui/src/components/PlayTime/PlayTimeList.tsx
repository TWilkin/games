import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Component } from 'react';
import Moment from 'react-moment';

import { GamePlayTime } from '../../models';
import SortableTable from '../SortableTable/SortableTable';

interface PlayTimeListProps {
    playTime?: GamePlayTime[];
}

export default class PlayTimeList extends Component<PlayTimeListProps> {
    render(): JSX.Element {
        return (
            <div className='playTime'>
                {this.props.playTime?.length > 0 ? (
                    <SortableTable<GamePlayTime>
                        title='Play Time'
                        headings={['Start', 'End', 'For', 'Demo']}
                        sortColumns={['startTime', 'endTime', null, 'demo']}
                        data={this.props.playTime}
                        row={this.renderCells}
                    />
                ) : null}
            </div>
        );
    }

    renderCells(playTime: GamePlayTime): JSX.Element[] {
        return playTime?.endTime && (
            [
                <Moment key='startTime' date={playTime.startTime} format='L LT' />,
                <Moment key='endTime' date={playTime.endTime} format='L LT' />,
                <Moment key='duration' duration={playTime.startTime} date={playTime.endTime} format='hh:mm:ss' />,
                playTime.demo ? <FontAwesomeIcon key='isDemo' icon={faCheckCircle} /> : null
            ]
        );
    }
}
