import React, { Component } from 'react';

import { APIProps } from '../common';
import { GamePlayTime } from '../../models';
import query, { mutate, mutations, queries } from '../../graphql';

interface PlayTimeCounterProps extends APIProps {
    gamePlatformId: number;
}

interface PlayTimeCounterState {
    gamePlayTime?: GamePlayTime;
    counter?: number;
    timer?: NodeJS.Timeout;
}

export default class PlayTimeCounter extends Component<PlayTimeCounterProps, PlayTimeCounterState> {

    constructor(props: PlayTimeCounterProps) {
        super(props);

        this.state = {
            gamePlayTime: null,
            counter: 0,
            timer: null
        };

        this.onStart = this.onStart.bind(this);
        this.onStop = this.onStop.bind(this);
    }

    public async componentDidMount() {
        // check if there is started playtime for this game
        try {
            const args = {
                // TODO add query for current user
                gamePlatformId: this.props.gamePlatformId,
                endTime: null as Date
            };
            const data: GamePlayTime[] = await query(this.props.api.url, queries['GamePlayTime'], args);

            // if we have records
            if(data && data.length > 0) {
                // find the latest startTime
                const latest = data.reduce((latest, current) => {
                    if(!latest || latest.startTime < current.startTime)
                    {
                        return current;
                    }
                    return latest;
                }, null);

                // set that as the current timer
                if(latest) {
                    this.start(latest);
                }
            }
        } catch(error) {
            this.props.api.onError(error);
        }
    }

    private async onStart(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        
        try {
            // create the new playtime in the API
            const args = {
                input: {
                    gamePlatformId: this.props.gamePlatformId,
                    startTime: Date.now()
                }
            };
            const data: GamePlayTime = await mutate(this.props.api.url, mutations['add']['GamePlayTime'], args);

            // check the add worked
            if(data) {
                this.start(data);
            }
        } catch(error) {
            this.props.api.onError(error);
        }
    }

    private async onStop(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        
        // stop the counter
        clearInterval(this.state.timer);

        try {
            // update the playtime in the API
            const args = {
                id: this.state.gamePlayTime.gamePlayTimeId,
                input: {
                    startTime: this.state.gamePlayTime.startTime,
                    endTime: Date.now()
                }
            };
            const data: GamePlayTime = await mutate(this.props.api.url, mutations['update']['GamePlayTime'], args);

            // check the update worked
            if(data) {
                this.setState({ 
                    gamePlayTime: null,
                    counter: 0,
                    timer: null
                });
            }
        } catch(error) {
            this.props.api.onError(error);
        }
    }

    public render() {
        return (
            <div className='playTimeCounter'>
                {this.renderTimer()}
                {this.renderStart()}
                {this.renderStop()}
            </div>
        );
    }

    private renderStart() {
        // show the start button when we are not counting
        if(!this.state.gamePlayTime) {
            return (
                <button type='button' onClick={this.onStart}>
                    Start Play Counter
                </button>
            );
        }
    }

    private renderStop() {
        // show the stop button while we are counting
        if(this.state.gamePlayTime) {
            return (
                <button type='button' onClick={this.onStop}>
                    Stop Play Counter
                </button>
            );
        }
    }

    private renderTimer() {
        // show time timer if we have a start time
        if(this.state.gamePlayTime) {
            return (
                <span>{this.timeSince()}</span>
            );
        }
    }

    private start(gamePlayTime: GamePlayTime) {
        // update the state and start the counter
        this.setState({ 
            gamePlayTime: gamePlayTime,
            counter: 0,
            timer: setInterval(() => {
                this.setState({
                    counter: this.state.counter + 1
                });
            }, 1000)
        });
    }

    private timeSince(): string {
        // calculate how many seconds have elapsed
        const startTime = new Date(this.state.gamePlayTime.startTime).getTime();
        let seconds = Math.floor((Date.now() - startTime) / 1000);

        // hours
        const hours = Math.floor(seconds / (60 * 60));
        seconds -= hours * 60 * 60;
        
        // minutes
        const minutes = Math.floor(seconds / 60);
        seconds -= minutes * 60;

        return [hours, minutes, seconds]
            .map(interval => interval.toString().padStart(2, '0'))
            .join(':');
    }

};
