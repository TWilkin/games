import React from 'react';

import { GamePlatform } from '../../models';

interface GameSummaryProps {
    gamePlatform: GamePlatform;
}

const GameSummary = ({ gamePlatform }: GameSummaryProps): JSX.Element => {
    const title = gamePlatform.alias ?? gamePlatform.game.title;
        
    return (
        <div className='gameSummary'>
            {title} ({gamePlatform.platform?.name})
        </div>
    );
};

export default GameSummary;
