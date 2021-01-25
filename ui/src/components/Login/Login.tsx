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
        <div id='login' className='panel'>
            <h1 className='panel__heading'>Login</h1>

            <form onSubmit={onSubmit} className='form'>
                {!loggedId && (
                    <>
                        <div className='field'>
                            <div className='field__label'>
                                <label htmlFor='loginUserName'>Username:</label>
                            </div>
                            <div className='field__input'>
                                <input 
                                    type='text'
                                    name='userName'
                                    id='loginUserName'
                                    ref={loginForm}
                                    onChange={onChange} />
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
                                    ref={loginForm}
                                    onChange={onChange} />
                            </div>
                        </div>
                        <div className='form__actions'>
                            <button type='submit'>Login</button>
                        </div>
                    </>
                )}

                {loggedId === true && (
                    <div className='panel panel--alert panel--success anim--slide-in'>
                        Login successful!
                    </div>
                )}

                {loggedId === false && (
                    <div className='panel panel--alert panel--error anim--shake'>
                        Login failed!
                    </div>
                )}
            </form>
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
