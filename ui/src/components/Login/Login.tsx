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
            <div id='login'>
                <form onSubmit={this.handleSubmit}>
                    <label>Username:</label>
                    <input 
                        type='text'
                        name='userName'
                        value={this.state.userName}
                        onChange={this.handleChange} />
                    <br />

                    <label>Password:</label>
                    <input 
                        type='password'
                        name='password'
                        value={this.state.password}
                        onChange={this.handleChange} />
                    <br />

                    <input type='submit'value='Login' />
                    
                    {this.state.success == true && (
                        <div>Login successful!</div>
                    )}
                    {this.state.success == false && (
                        <div>Login failed!</div>
                    )}
                </form>
            </div>
        );
    }
}
