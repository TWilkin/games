import React from 'react';
import { NavLink } from 'react-router-dom';

import { UserProps } from '../common';
import { Restricted } from './Restricted';

const Admin = ({ user }: UserProps): JSX.Element => {
    return (
        <Restricted user={user}>
            <div className='panel'>
                <h1 className='panel__heading'>Admin</h1>

                <NavLink to={'/games/create'}>Add Game</NavLink>
            </div>
        </Restricted>
    );
};

export default Admin;
