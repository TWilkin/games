import HttpStatus from 'http-status-codes';
import React, { Component, FormEvent } from 'react';

type LoginProps = {};

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
    }

    private handleChange = (event: FormEvent<HTMLInputElement>) => {
        const { name, value } = event.currentTarget;
        this.setState({
            [name]: value
        });
    };

    private handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        
        // attempt the login
        try {
            const result = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify({
                    userName: this.state.userName,
                    password: this.state.password
                })
            });
            this.setState({ success: result.status == HttpStatus.OK });
        } catch(e) {
            this.setState({ success: false });
        }
    };

    public render() {
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

                    <input 
                        type='submit'
                        value='Login' />
                    
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
