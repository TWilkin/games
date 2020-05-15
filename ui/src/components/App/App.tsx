import HttpStatus, { getStatusText } from 'http-status-codes';
import React, { Component } from 'react';
import { BrowserRouter, Link, Redirect, Route, Switch } from 'react-router-dom';

import Login from '../Login/Login';

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
    }

    public static getDerivedStateFromError(error: Error) {
        console.error(error);

        // check if the error is 401/403
        switch(error.message) {
            case getStatusText(HttpStatus.FORBIDDEN):
            case getStatusText(HttpStatus.UNAUTHORIZED):
                return { unauthorised: true };
        }
    }

    public render() {
        return (
            <BrowserRouter>
                {this.redirect()}

                <div>
                    <nav>
                        <ul>
                            <li><Link to='/login'>Login</Link></li>
                        </ul>
                    </nav>
                    <hr />
                
                    <Switch>
                        <Route path='/login'>
                            <Login apiUrl='http://localhost:3000/api' />
                        </Route>
                    </Switch>
                </div>
            </BrowserRouter>
        );
    }

    private redirect() {
        if(this.state.unauthorised) {
            this.setState({
                unauthorised: undefined
            });
            return <Redirect to='/login' />;
        }
    }

}
