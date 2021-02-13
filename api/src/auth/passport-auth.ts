import { Express, Response } from 'express';
import HttpStatus from 'http-status-codes';
import jsonwebtoken from 'jsonwebtoken';
import passport from 'passport';
import { ExtractJwt, Strategy as JWTStrategy } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';

import Configuration from '../config';
import User from '../models/user.model';

class PassportAuth {
    private constructor(private app: Express) { }

    private async login(
        response: Response,
        error: string, 
        identifier: User | boolean, 
        info: { message: string }
    ) {
        console.log(JSON.stringify(identifier));
        console.log(JSON.stringify(info));
        
        if(error) {
            console.error(error);
            response.status(HttpStatus.UNAUTHORIZED).send();
            return;
        }

        if(info?.message) {
            console.log(info.message);
        }

        if(identifier) {
            const user = identifier as User;
            console.log(`Authenticating user '${user?.userName}'`);

            const token = jsonwebtoken.sign(
                { 
                    userId: user.userId,
                    userName: user.userName,
                    role: user.role
                },
                Configuration.getAuth.secret
            );

            response.status(HttpStatus.OK).send({
                token,
                message: info?.message
            });
            return;
        }

        response.status(HttpStatus.UNAUTHORIZED).send();
    }

    public static init(app: Express): PassportAuth {
        const auth = new PassportAuth(app);

        app.use(passport.initialize());

        this.initStrategies(auth);

        return auth;
    }

    private static initStrategies(auth: PassportAuth): void {
        this.initJWTStrategy(auth);
        this.initLocalStrategy();
    }

    private static initJWTStrategy(auth: PassportAuth): void {
        passport.use(
            'login',
            new JWTStrategy(
                {
                    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
                    secretOrKey: Configuration.getAuth.secret
                },
                async (jwt, done) => {
                    console.log(JSON.stringify(jwt));
                    try {
                        const user = await User.findOne({
                            attributes: [
                                'userId',
                                'userName',
                                'role'
                            ],
                            where: {
                                userName: jwt.id
                            }
                        });

                        if(!user) {
                            done(null, false, { message: 'No user found in token'});
                        } else {
                            done(null, user);
                        }
                    } catch(error) {
                        console.error(error);
                        done('An error occurred');
                    }
                }
            )
        );

        auth.app.post(
            `${Configuration.getExpress.root}/passport/login`.replace('//', '/'),
            (request, response, next) => 
                passport.authenticate(
                    'login', 
                    (error: string, identifier: User | boolean, info: { message: string }) => 
                        auth.login(response, error, identifier, info)
                )(request, response, next)
        );
    }

    private static initLocalStrategy(): void {
        passport.use(
            'login',
            new LocalStrategy(
                {
                    usernameField: 'username',
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
    }
}

export default PassportAuth;
