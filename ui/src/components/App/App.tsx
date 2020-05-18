import HttpStatus, { getStatusText } from 'http-status-codes';
import jsonwebtoken from 'jsonwebtoken';
import React, { Component } from 'react';
import Cookies from 'react-cookies';
import { BrowserRouter, Link, Redirect, Route, Switch } from 'react-router-dom';

import Collection from '../Collection/Collection';
import { APISettings } from '../common';
import GameDetails from '../Game/GameDetails';
import Login from '../Login/Login';
import { User } from '../../models';
import GameList from '../Game/GameList';

const apiUrl = 'http://localhost:3000/api';

type AppProps = {};

interface AppState {
    unauthorised?: boolean;
    user?: User;
}

export default class App extends Component<AppProps, AppState> {

    constructor(props: AppProps) {
        super(props);

        const user = this.getUser;
        this.state = {
            unauthorised: user ? false : true,
            user: user
        };

        this.onError = this.onError.bind(this);
        this.onLogin = this.onLogin.bind(this);
    }

    public onLogin() {
        const user = this.getUser;
        this.setState({
            unauthorised: user ? false : true,
            user: user
        });
    }

    public onError(error: Error) {
        // check if the error is 401/403
        switch(error.message) {
            case getStatusText(HttpStatus.FORBIDDEN):
            case getStatusText(HttpStatus.UNAUTHORIZED):
                this.setState({ unauthorised: true });
        }
    }

    public render() {
        return (
            <BrowserRouter>
                {this.redirect()}

                <div>
                    {this.renderNavigation()}
                    <hr />
                
                    <Switch>
                        <Route path='/login'>
                            <Login 
                                api={this.getAPISettings}
                                onLogin={this.onLogin} />
                        </Route>
                        
                        <Route path='/user/:userId/collection'>
                            <Collection api={this.getAPISettings} />
                        </Route>

                        <Route path='/games'>
                            <GameList api={this.getAPISettings} />
                        </Route>
                        <Route path='/game/:gamePlatformId'>
                            <GameDetails api={this.getAPISettings} />
                        </Route>
                    </Switch>
                </div>
            </BrowserRouter>
        );
    }

    private renderNavigation() {
        let elements: JSX.Element;
        if(this.state.unauthorised) {
            elements = (
                <li><Link to='/login'>Login</Link></li>
            );
        } else {
            elements = (
                <li><Link to={`/user/${this.state.user.userId}/collection`}>My Collection</Link></li>
            );
        }

        return (
            <div className='menu'>
                <nav>
                    <ul>
                    <li><Link to='/games'>Games</Link></li>
                        {elements}
                    </ul>
                </nav>
            </div>
        )
    }

    private redirect() {
        if(this.state.unauthorised) {
            return <Redirect to='/login' />;
        }
    }

    private get getUser(): User | null {
        // retrieve the user from the server's cookie
        const jwt = Cookies.load('jwt');
        if(jwt) {
            return jsonwebtoken.decode(jwt) as User;
        }

        return null;
    }

    private get getAPISettings(): APISettings {
        return {
            url: apiUrl,
            user: this.state.user,
            onError: this.onError
        };
    }

};
