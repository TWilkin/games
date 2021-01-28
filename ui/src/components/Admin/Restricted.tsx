import React from 'react';

import { User } from '../../models';

interface RestrictedProps {
    user?: User;
    children: JSX.Element;
}

const Restricted = ({ user, children }: RestrictedProps): JSX.Element => {
    if(user?.role === 'admin') {
        return children;
    }

    return (
        <div className='panel'>
            <h1 className='panel__heading'>Forbidden</h1>

            <div className='panel panel--alert panel--error anim--shake'>
                You do not have the necessary permissions to view this page.
            </div>
        </div>
    );
};

export default Restricted;
