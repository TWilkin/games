import React, { Component, ChangeEvent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { APIProps } from '../common';
import query, { queries, mutate, mutations } from '../../graphql';
import { Game, GamePlatform, Platform } from '../../models';
import PlatformFilter from '../Platform/PlatformFilter';
import './GameForm.css';

interface GameFormMatch {
    gameId: string;
}

interface GameFormProps extends APIProps, RouteComponentProps<GameFormMatch> { }

interface GameFormPlatform {
    gamePlatformId: number | null;
    platformId: number;
    name: string;
    alias: string;
}

interface GameFormState {
    game: Game;
    platforms: GameFormPlatform[]
}

class GameForm extends Component<GameFormProps, GameFormState> {

    constructor(props: GameFormProps) {
        super(props);

        this.state = {
            game: null,
            platforms: []
        };

        this.onAliasChange = this.onAliasChange.bind(this);
        this.onPlatformRemoveClick = this.onPlatformRemoveClick.bind(this);
        this.onPlatformSelect = this.onPlatformSelect.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onTitleChange = this.onTitleChange.bind(this);
    }

    public componentDidMount() {
        const gameId = parseInt(this.props.match.params.gameId);
        this.load(gameId);
    }

    public componentDidUpdate() {
        // if the id has changed, load the new data
        const gameId = parseInt(this.props.match.params.gameId);
        if(this.state.game && this.state.game.gameId != gameId) {
            this.load(gameId);
        }
    }

    private onAliasChange(event: ChangeEvent<HTMLInputElement>, platformId: number) {
        event.preventDefault();

        // update the game platform
        const platforms = this.state.platforms;
        const platform = platforms.find(platform => platform.platformId == platformId);
        if(platform) {
            platform.alias = event.currentTarget.value;

            this.setState({
                platforms: platforms
            });
        }
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
                gamePlatformId: null,
                platformId: platform.platformId,
                name: platform.name,
                alias: null
            });
            this.setState({
                platforms: platforms
            });
        }
    }

    private onSubmit(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        this.save();
    }

    private onTitleChange(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault();

        // initialise the game if it's unset and set the title
        let game = this.state.game;
        if(!game) {
            game = {
                gameId: null,
                title: null
            }
        }
        game.title = event.currentTarget.value;

        this.setState({
            game: game
        });
    }

    public render() {
        // retrieve the existing value if we're editing
        const title = this.state.game && this.state.game.title ? this.state.game.title : '';

        return (
            <div>
                <label>
                    Title:&nbsp;
                    <input
                            type='text' 
                            value={title}
                            onChange={this.onTitleChange} />
                </label>
                <br />

                <label>
                    Platforms: 
                    <PlatformFilter
                        api={this.props.api}
                        onSelect={this.onPlatformSelect} />
                </label>

                {this.renderPlatforms()}

                <button 
                        type='button' 
                        onClick={this.onSubmit}>
                    Save
                </button>
            </div>
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
                        <input 
                                type='text' 
                                value={alias} 
                                onChange={event => this.onAliasChange(event, platform.platformId)} />
                    </label>

                    <span 
                            className='button' 
                            onClick={event => this.onPlatformRemoveClick(event, platform.platformId)}>
                        &times;
                    </span>
                </div>
            );
        });
    }

    private async load(gameId?: number) {
        // check the gameId is set
        if(!gameId) {
            return;
        }

        try {
            // load the game
            const args = { gameId: gameId };
            const games: Game[] = await query(this.props.api.url, queries['Game'], args);
            const game = games && games.length >= 1 ? games[0] : undefined;

            // load the game platforms (if any)
            let platforms: GameFormPlatform[] = [];
            if(game) {
                const gamePlatforms: GamePlatform[] = await query(this.props.api.url, queries['GamePlatform'], args);
                platforms = gamePlatforms.map(gamePlatform => {
                    return {
                        gamePlatformId: gamePlatform.gamePlatformId,
                        platformId: gamePlatform.platform.platformId,
                        name: gamePlatform.platform.name,
                        alias: gamePlatform.alias
                    }
                });
            }

            // update the state
            this.setState({
                game: game,
                platforms: platforms
            });
        } catch(error) {
            this.props.api.onError(error);
        }
    }

    private async save() {
        try {
            // first let's store the game
            let args = {
                id: null as number,
                input: {
                    title: this.state.game.title
                }
            };

            // decide if we're updating or creating
            let query = mutations['add']['Game'];
            if(this.state.game.gameId) {
                // updating
                args.id = this.state.game.gameId;
                query = mutations['update']['Game'];
            }

            // add/update the game
            const game: Game = await mutate(this.props.api.url, query, args);

            // now add/update the platforms
            this.state.platforms.forEach(async platform => {
                let args = {
                    id: null as number,
                    input: {
                        gameId: game.gameId,
                        platformId: platform.platformId,
                        alias: platform.alias
                    }
                };

                // decide if we're updating or creating
                let query = mutations['add']['GamePlatform'];
                if(platform.gamePlatformId) {
                    args.id = platform.gamePlatformId;
                    query = mutations['update']['GamePlatform'];
                }

                // add/update the game platform
                await mutate(this.props.api.url, query, args);
            });
        } catch(error) {
            this.props.api.onError(error);
        }
    }

}

export default withRouter(GameForm);
