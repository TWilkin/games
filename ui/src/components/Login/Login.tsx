import HttpStatus from 'http-status-codes';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';

import { APIProps, APISettings } from '../common';

interface LoginProps extends APIProps {
    onLogin: () => void;
}

interface LoginFormData {
    userName: string;
    password: string;
}

const Login = ({ api, onLogin }: LoginProps): JSX.Element => {
    const [ loggedId, setLoggedIn ] = useState<boolean>(undefined);
    
    const { loginForm, onSubmit } = useLoginForm(api, (status) => {
        setLoggedIn(status);
        if(status) {
            onLogin();
        }
    });

    const onChange = () => setLoggedIn(undefined);

    return (
        <div id='login'>
            {!loggedId && (
                <form onSubmit={onSubmit}>
                    <label>Username:</label>
                    <input 
                        type='text'
                        name='userName'
                        ref={loginForm}
                        onChange={onChange} />
                    <br />

                    <label>Password:</label>
                    <input 
                        type='password'
                        name='password'
                        ref={loginForm}
                        onChange={onChange} />
                    <br />

                    <input type='submit' value='Login' />
                </form>
            )}

            {loggedId === true && (
                <div>Login successful!</div>
            )}

            {loggedId === false && (
                <div>Login failed!</div>
            )}
        </div>
    );
};

export default Login;

function useLoginForm(api: APISettings, onLogin: (status: boolean) => void) {
    const { register, handleSubmit } = useForm<LoginFormData>();

    const onSubmit = useCallback(
        async (data: LoginFormData) => onLogin(await handleLogin(api, data)),
        []
    );

    return {
        loginForm: register,
        onSubmit: handleSubmit(onSubmit)
    };
}

async function handleLogin(api: APISettings, data: LoginFormData): Promise<boolean> {
    // attempt the login
    try {
        const result = await fetch(`${api.url}/login`, {
            method: 'POST',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(data)
        });

        if(result.status === HttpStatus.OK) {
            return true;
        }
        return false;
    } catch(e) {
        return false;
    }
}
