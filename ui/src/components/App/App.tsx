import React from 'react';

import Login from '../Login/Login';

export default class Layout extends React.Component {

    public render() {
        return <Login apiUrl='http://localhost:3000/api' />;
    }

}
