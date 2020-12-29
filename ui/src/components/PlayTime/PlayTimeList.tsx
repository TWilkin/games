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
    render() {
        let content: JSX.Element;

        if(this.props.playTime?.length > 0) {
            content = <SortableTable<GamePlayTime>
                title='Play Time'
                headings={['Start', 'End', 'For', 'Demo']}
                data={this.props.playTime}
                row={this.renderCells}
                />
        } else {
            content = <></>;
        }

        return <div className='playTime'>{content}</div>;
    }

    renderCells(playTime: GamePlayTime) {
        return playTime?.endTime ? (
            [
                <Moment date={playTime.startTime} format='L LT' />,
                <Moment date={playTime.endTime} format='L LT' />,
                <Moment duration={playTime.startTime} date={playTime.endTime} format='hh:mm:ss' />,
                playTime.demo ? <FontAwesomeIcon icon={faCheckCircle} /> : null
            ]
        ) : null;
    }
};
