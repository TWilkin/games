import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { APIProps } from '../common';
import PlatformFilter from '../Platform/PlatformFilter';
import { Platform } from '../../models';
import './GameForm.css';

interface GameFormMatch {
    gamePlatformId: string;
}

interface GameFormProps extends APIProps, RouteComponentProps<GameFormMatch> { }

interface GameFormState {
    platforms: { 
        platformId: number;
        name: string;
        alias: string;
    }[]
}

class GameForm extends Component<GameFormProps, GameFormState> {

    constructor(props: GameFormProps) {
        super(props);

        this.state = {
            platforms: []
        };

        this.onPlatformRemoveClick = this.onPlatformRemoveClick.bind(this);
        this.onPlatformSelect = this.onPlatformSelect.bind(this);
    }

    private onPlatformRemoveClick(
            event: React.MouseEvent<HTMLSpanElement, MouseEvent>,
            platformId: number)
    {
        event.preventDefault();
        
        // find the specified platform and remove it from the list
        const platforms = this.state.platforms
                .filter(platform => platform.platformId != platformId);
        this.setState({
            platforms: platforms
        });
    }

    public onPlatformSelect(platform: Platform) {
        // add this platform if it's not already there
        const platforms = this.state.platforms;
        const entry = this.state.platforms
                .find(added => added.platformId == platform.platformId);
        if(!entry) {
            platforms.push({
                platformId: platform.platformId,
                name: platform.name,
                alias: null
            });
            this.setState({
                platforms: platforms
            });
        }
    }

    public render() {
        return (
            <form>
                <label>
                    Title:&nbsp;
                    <input type='text' />
                </label>
                <br />

                <label>
                    Platforms: 
                    <PlatformFilter
                        api={this.props.api}
                        onSelect={this.onPlatformSelect} />
                </label>

                {this.renderPlatforms()}

                <input type='submit' value='Save' />
            </form>
        );
    }

    private renderPlatforms(): JSX.Element[] {
        return this.state.platforms.map(platform => {
            const alias = platform.alias ? platform.alias : '';
            return (
                <div key={platform.platformId}>
                    {platform.name}:&nbsp;

                    <label>
                        Alias: 
                        <input type='text' value={alias} />
                    </label>

                    <span 
                            className='button' 
                            onClick={(event) => this.onPlatformRemoveClick(event, platform.platformId)}>
                        &times;
                    </span>
                </div>
            );
        });
    }

}

export default withRouter(GameForm);
