import HttpStatus, { getStatusText } from 'http-status-codes';
import React, { Component } from 'react';
import { BrowserRouter, Link, Redirect, Route, Switch } from 'react-router-dom';

import Collection from '../Collection/Collection';
import GameDetails from '../GameDetails/GameDetails';
import Login from '../Login/Login';

const apiUrl = 'http://localhost:3000/api';

type AppProps = {};

interface AppState {
    unauthorised?: boolean;
}

export default class App extends Component<AppProps, AppState> {

    constructor(props: AppProps) {
        super(props);

        this.state = {
            unauthorised: undefined
        };

        this.onError = this.onError.bind(this);
        this.onLogin = this.onLogin.bind(this);
    }

    public onLogin() {
        this.setState({
            unauthorised: false
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
                    <nav>
                        <ul>
                            <li><Link to='/collection'>My Collection</Link></li>
                        </ul>
                    </nav>
                    <hr />
                
                    <Switch>
                        <Route path='/login'>
                            <Login 
                                apiUrl={apiUrl}
                                onError={this.onError}
                                onLogin={this.onLogin} />
                        </Route>
                        <Route path='/collection'>
                            <Collection
                                apiUrl={apiUrl}
                                onError={this.onError} />
                        </Route>
                        <Route path='/game/:gameId'>
                            <GameDetails 
                                apiUrl={apiUrl}
                                onError={this.onError}  />
                        </Route>
                    </Switch>
                </div>
            </BrowserRouter>
        );
    }

    private redirect() {
        if(this.state.unauthorised) {
            return <Redirect to='/login' />;
        }
    }

}
