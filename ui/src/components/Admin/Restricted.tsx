import React from 'react';

import { User } from '../../models';
import { UserProps } from '../common';

interface RestrictedProps extends UserProps {
    children: JSX.Element;
}

export const Restricted = ({ user, children }: RestrictedProps): JSX.Element => {
    if(isAdmin(user)) {
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

export const RestrictedButton = ({ user, children }: RestrictedProps): JSX.Element =>
    isAdmin(user) ? children : <></>;

function isAdmin(user?: User) {
    return user?.role === 'admin';
}
