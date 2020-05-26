import React, { ChangeEvent, Component, FormEvent } from 'react';

import { APIProps } from '../common';
import { GamePlatform, GamePlayTime } from '../../models';
import query, { mutate, mutations, queries } from '../../graphql';
import ModalDialog from '../ModalDialog/ModalDialog';

interface PlayTimeCounterProps extends APIProps {
    gamePlatform: GamePlatform;
}

interface PlayTimeCounterState {
    gamePlayTime?: GamePlayTime;
    gameCompilationId?: number;
    demo?: boolean;
    counter?: number;
    timer?: NodeJS.Timeout;
    compilationDialogVisible?: boolean;
}

export default class PlayTimeCounter extends Component<PlayTimeCounterProps, PlayTimeCounterState> {

    constructor(props: PlayTimeCounterProps) {
        super(props);

        this.state = {
            gamePlayTime: null,
            gameCompilationId: null,
            demo: null,
            counter: 0,
            timer: null,
            compilationDialogVisible: false
        };

        this.onCompilationSelect = this.onCompilationSelect.bind(this);
        this.onDemoChange = this.onDemoChange.bind(this);
        this.onDialogClose = this.onDialogClose.bind(this);
        this.onStart = this.onStart.bind(this);
        this.onStop = this.onStop.bind(this);
    }

    public async componentDidMount() {
        // check if there is playtime already for this game
        try {
            const args = {
                gamePlatformId: this.props.gamePlatform.gamePlatformId,
                userId: this.props.api.user.userId,
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

    private onCompilationSelect(event: FormEvent<HTMLSelectElement>) {
        event.preventDefault();

        let gameCompilationId = parseInt(event.currentTarget.value);
        if(gameCompilationId == -1) {
            gameCompilationId = null;
        }
        this.setState({
            gameCompilationId: gameCompilationId
        });
    }

    private onDemoChange(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault();

        this.setState({
            demo: event.target.checked
        });
    }

    private onDialogClose(cancelled: boolean) {
        if(!cancelled) {
            this.startCounter();
        }
        this.setState({
            compilationDialogVisible: false
        });
    }

    private onStart(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();

        // show dialog
        this.setState({
            compilationDialogVisible: true
        });
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
                    gameCompilationId: this.state.gameCompilationId,
                    demo: this.state.demo,
                    startTime: this.state.gamePlayTime.startTime,
                    endTime: Date.now()
                }
            };
            const data: GamePlayTime = await mutate(this.props.api.url, mutations['update']['GamePlayTime'], args);

            // check the update worked
            if(data) {
                this.setState({ 
                    gamePlayTime: null,
                    gameCompilationId: null,
                    demo: null,
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
                {this.renderStartDialog()}
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

    private renderStartDialog() {
        return (
            <ModalDialog
                    submit='Start'
                    cancel='Cancel'
                    visible={this.state.compilationDialogVisible}
                    onClose={this.onDialogClose}>
                {this.renderCompilationSelect()}
                <br />
                <label>Demo? 
                    <input type='checkbox' value='Demo' onChange={this.onDemoChange} />
                </label>
            </ModalDialog>
        );
    }

    private renderCompilationSelect() {
        if(this.props.gamePlatform.game.includes 
                && this.props.gamePlatform.game.includes.length > 0)
        {
            return (
                <select onChange={this.onCompilationSelect} defaultValue='-1'>
                    <option key='-1' value='-1'>-</option>
                    {this.props.gamePlatform.game.includes.map(compilation => {
                        return (
                            <option 
                                    key={compilation.gameCompilationId} 
                                    value={compilation.gameCompilationId}>
                                {compilation.included.title}
                            </option>
                        );
                    })}
                </select>
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

    private async startCounter() {
        try {
            // create the new playtime in the API
            const args = {
                input: {
                    gamePlatformId: this.props.gamePlatform.gamePlatformId,
                    gameCompilationId: this.state.gameCompilationId,
                    demo: this.state.demo,
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

    private start(gamePlayTime: GamePlayTime) {
        // update the state and start the counter
        this.setState({ 
            gamePlayTime: gamePlayTime,
            gameCompilationId: gamePlayTime.gameCompilationId,
            demo: gamePlayTime.demo,
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
