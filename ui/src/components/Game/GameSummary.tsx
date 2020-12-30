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
        const title = this.props.gamePlatform.alias ? this.props.gamePlatform.alias : this.props.gamePlatform.game.title;
        
        return (
            <div className='gameSummary'>
                {title} ({this.props.gamePlatform.platform.name})
            </div>
        )
    }

};
