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

            <div>
                <div className='menu'>
                    <nav>
                        <NavLink to='/games'>Games</NavLink>
                        {!authorised ? (
                            <NavLink to='/login'>Login</NavLink>
                        ) : (
                            <>
                                <NavLink to={`/user/${user.userId}/collection`}>My Collection</NavLink>
                                <NavLink to={`/user/${user.userId}/wishlist`}>My Wishlist</NavLink>
                            </>
                        )}
                    </nav>
                </div>
                <hr />
            
                <Switch>
                    <Route path='/login'>
                        <Login 
                            api={api}
                            onLogin={onLogin} />
                    </Route>
                    
                    <Route path='/user/:userId/collection'>
                        <Collection api={api} />
                    </Route>
                    <Route path='/user/:userId/wishlist'>
                        <Wishlist api={api} />
                    </Route>

                    <Route path='/games'>
                        <AllGameList api={api} />
                    </Route>
                    <Route path='/game/:gamePlatformId'>
                        <GameDetails api={api} />
                    </Route>
                </Switch>
            </div>
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
