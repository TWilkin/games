import HttpStatus, { getStatusText } from 'http-status-codes';
import jsonwebtoken from 'jsonwebtoken';
import React, { useState } from 'react';
import Cookies from 'react-cookies';
import { BrowserRouter, NavLink, Redirect, Route, Switch } from 'react-router-dom';

import Collection from '../Collection/Collection';
import { AllGameList } from '../Game/GameList';
import GameDetails from '../Game/GameDetails';
import Login from '../Login/Login';
import { User } from '../../models';
import Wishlist from '../Wishlist/Wishlist';

const apiUrl = `${window.location.origin}/api`;

const App = (): JSX.Element => { 
    const [user, setUser] = useState(getCookie());
    const [authorised, setAuthorised] = useState(user !== null);

    const api = {
        url: apiUrl,
        user: user,
        onError: (error: Error) => {
            switch(error.message) {
                case getStatusText(HttpStatus.FORBIDDEN):
                case getStatusText(HttpStatus.UNAUTHORIZED):
                    setAuthorised(false);
            }
        }
    };

    const onLogin = () => {
        const user = getCookie();
        setUser(user);
        setAuthorised(user !== null);
    };

    return (
        <BrowserRouter>
            {!authorised && <Redirect to='/login' />}

            <header className='header'>
                <nav className='menu full-page'>
                    <NavLink to='/games'>Games</NavLink>
                    {!authorised ? (
                        <NavLink to='/login'>Login</NavLink>
                    ) : (
                        <>
                            <NavLink to={`/users/${user.userId}/collection`}>My Collection</NavLink>
                            <NavLink to={`/users/${user.userId}/wishlist`}>My Wishlist</NavLink>
                        </>
                    )}
                </nav>
            </header>
            
            <main className='full-page'>
                <Switch>
                    <Route path='/login'>
                        <Login 
                            api={api}
                            onLogin={onLogin} />
                    </Route>
                    
                    <Route path='/users/:userId/collection'>
                        <Collection api={api} />
                    </Route>
                    <Route path='/users/:userId/wishlist'>
                        <Wishlist api={api} />
                    </Route>

                    <Route path='/games/:gamePlatformId'>
                        <GameDetails api={api} />
                    </Route>
                    <Route path='/games'>
                        <AllGameList api={api} />
                    </Route>
                </Switch>
            </main>
        </BrowserRouter>
    );
};

export default App;

function getCookie() {
    // retrieve the user from the server's cookie
    const jwt = Cookies.load('jwt');
    if(jwt) {
        return jsonwebtoken.decode(jwt) as User;
    }

    return null;
}
