import HttpStatus from 'http-status-codes';
import React, { Component, FormEvent } from 'react';

import { APIProps } from '../common';

interface LoginProps extends APIProps {
    onLogin: () => void;
}

interface LoginState {
    userName?: string;
    password?: string;
    success?: boolean;
}

export default class Login extends Component<LoginProps, LoginState> {

    constructor(props: LoginProps) {
        super(props);

        this.state = {
            userName: '',
            password: ''
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    private handleChange(event: FormEvent<HTMLInputElement>) {
        const { name, value } = event.currentTarget;
        this.setState({
            [name]: value
        });
    }

    private async handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        
        // attempt the login
        try {
            const result = await fetch(`${this.props.api.url}/login`, {
                method: 'POST',
                credentials: 'include',
                headers: new Headers({
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify({
                    userName: this.state.userName,
                    password: this.state.password
                })
            });
            if(result.status == HttpStatus.OK) {
                this.setState({ success: true });
                this.props.onLogin();
            }
        } catch(e) {
            this.setState({ success: false });
        }
    }

    public render(): JSX.Element {
        return (
            <div id='login' className='panel'>
                <h1 className='panel__heading'>Login</h1>
                <form onSubmit={this.handleSubmit} className='form'>
                    <div className='field'>
                        <div className='field__label'>
                            <label htmlFor='loginUserName'>Username:</label>
                        </div>
                        <div className='field__input'>
                            <input 
                                type='text'
                                name='userName'
                                id='loginUserName'
                                value={this.state.userName}
                                onChange={this.handleChange} />
                        </div>
                    </div>
        
                    <div className='field'>
                        <div className='field__label'>
                            <label htmlFor='loginPassword'>Password:</label>
                        </div>
                        <div className='field__input'>
                            <input 
                                type='password'
                                name='password'
                                id='loginPassword'
                                value={this.state.password}
                                onChange={this.handleChange} />
                        </div>
                    </div>
                    <div className='form__actions'>
                        <button type='submit'>Login</button>
                    </div>
                    
                    {this.state.success == true && (
                        <div className='panel panel--alert panel--success anim--slide-in'>
                            Login successful!
                        </div>
                    )}
                    {this.state.success == false && (
                        <div className='panel panel--alert panel--error anim--shake'>
                            Login failed!
                        </div>
                    )}
                </form>
            </div>
        );
    }
}
