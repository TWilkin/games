import React from 'react';
import { BrowserRouter, Link, Route, Switch } from 'react-router-dom';

import Login from '../Login/Login';

export default class Layout extends React.Component {

    public render() {
        return (
            <BrowserRouter>
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

}
