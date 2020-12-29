import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Component } from 'react';
import Moment from 'react-moment';
import { GamePlayTime } from '../../models';

interface PlayTimeListProps {
    playTime?: GamePlayTime[];
}

export default class PlayTimeList extends Component<PlayTimeListProps> {
    render() {
        let content: JSX.Element;

        if(this.props.playTime?.length > 0) {
            content = (
                <table>
                    <tr>
                        <th colSpan={4}>Play Time</th>
                    </tr>

                    <tr>
                        <th>Start</th>
                        <th>End</th>
                        <th>For</th>
                        <th>Demo</th>
                    </tr>

                    {this.props.playTime.map(playTime => (
                        playTime?.endTime ? (
                            <tr>
                                <td><Moment date={playTime.startTime} format='L LT' /></td>
                                <td><Moment date={playTime.endTime} format='L LT' /></td>
                                <td><Moment duration={playTime.startTime} date={playTime.endTime} format='hh:mm:ss' /></td>
                                <td>{playTime.demo ? <FontAwesomeIcon icon={faCheckCircle} /> : null}</td>
                            </tr>
                        ) : null
                    ))}
                </table>
            );
        } else {
            content = <></>;
        }

        return <div className='playTime'>{content}</div>;
    }
};
