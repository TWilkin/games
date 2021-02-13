import { Express, NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { Strategy } from 'passport-local';

import Configuration from '../config';
import User from '../models/user.model';
import PassportAuth from './passport-auth';

export default function local(auth: PassportAuth, app: Express): void {
    passport.use(
        'local',
        new Strategy(
            {
                usernameField: 'userName',
                passwordField: 'password'
            },
            async (username, password, done) => {
                try {
                    const user = await User.authenticate(username, password);

                    if(!user) {
                        return done(null, false, { message: 'Wrong username or password'});
                    }

                    return done(null, user, { message: 'Logged in successfully'});
                } catch(error) {
                    console.error(error);
                    return done('An error occurred');
                }
            }
        )
    );

    app.post(
        `${Configuration.getExpress.root}/login`.replace('//', '/'),
        (request: Request, response: Response, next: NextFunction) => 
            passport.authenticate(
                'local', 
                (error: string, identifier: User | boolean, info: { message: string }) => 
                    auth.authenticate(request, response, error, identifier, info)
            )(request, response, next)
    );
}
