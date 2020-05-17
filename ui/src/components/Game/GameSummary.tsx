import React, { Component } from 'react';
import { GamePlatform } from '../../models';

interface GameSummaryProps {
    gamePlatform: GamePlatform;
}

export default class GameSummary extends Component<GameSummaryProps, {}> {

    constructor(props: GameSummaryProps) {
        super(props);
    }

    public render() {
        return (
            <div className='gameSummary'>
                {this.props.gamePlatform.game.title} ({this.props.gamePlatform.platform.name})
            </div>
        )
    }

};
