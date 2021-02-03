import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App/App';
import './extensions';
import './styles/main.scss';

moment.locale('en-GB');

ReactDOM.render(
    <App />,
    document.getElementById('content')
);
