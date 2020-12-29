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
                        <th>Start</th>
                        <th>End</th>
                    </tr>

                    {this.props.playTime.map(playTime => (
                        <tr>
                            <td><Moment date={playTime.startTime} format='L LT' /></td>
                            <td><Moment date={playTime.endTime} format='L LT' /></td>
                        </tr>
                    ))}
                </table>
            );
        } else {
            content = <></>;
        }

        return <div className='playTime'>{content}</div>;
    }
};
