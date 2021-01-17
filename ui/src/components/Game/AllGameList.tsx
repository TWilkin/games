import React, { Component } from 'react';

import { APIProps } from '../common';
import { queries } from '../../graphql';
import GameList from './GameList';

export default class AllGameList extends Component<APIProps> {
    render() {
        return (
            <GameList api={this.props.api} query={queries['GamePlatform']} />
        )
    }
};
