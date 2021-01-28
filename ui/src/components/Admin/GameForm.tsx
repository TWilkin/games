import React from 'react';

import { APIProps } from '../common';
import Restricted from './Restricted';

const GameForm = ({ api }: APIProps): JSX.Element => {
    return (
        <Restricted user={api.user}>
            <div className='panel'>
                <h1 className='panel__heading'>Add Game</h1>
            </div>
        </Restricted>
    );
};

export default GameForm;
