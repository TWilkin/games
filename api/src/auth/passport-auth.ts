import { Express, NextFunction, Request, RequestHandler, Response } from 'express';
import HttpStatus from 'http-status-codes';
import jsonwebtoken from 'jsonwebtoken';
import passport from 'passport';
import { ExtractJwt, Strategy as JWTStrategy } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';

import Configuration from '../config';
import User, { Role } from '../models/user.model';

// interface for the extra property in an authenticated request
export interface AuthenticatedRequest {

    // the user retrieved from the header
    user?: {
        userId: number,
        userName: string,
        role: Role
    };

}

class PassportAuth {
    private constructor(private app: Express) { }

    public requireUserRole = this.requireRoles;

    public requireAdminRole = () => this.requireRoles(['admin']);

    private requireRoles(roles: Role[]=['user', 'admin']): RequestHandler {
        return (request, response, next) => 
            passport.authenticate(
                'jwt',
                { session: false },
                (error: string, identifier: User | boolean, info: { message: string }) => 
                    this.authorise(request, response, next, roles, error, identifier, info)
            )(request, response, next);
    }

    public static init(app: Express): PassportAuth {
        const auth = new PassportAuth(app);

        app.use(passport.initialize());

        this.initStrategies(auth);

        return auth;
    }

    private async authenticate(
        request: Request,
        response: Response,
        error: string, 
        identifier: User | boolean, 
        info: { message: string }
    ) {
        if(error) {
            console.error(error);
            response.status(HttpStatus.UNAUTHORIZED).send();
            return;
        }

        if(identifier) {
            request.logIn(identifier, (error) => {
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
            });
        } else {
            response.status(HttpStatus.UNAUTHORIZED).send({
                message: info?.message
            });
        }
    }

    private async authorise(
        request: Request,
        response: Response,
        next: NextFunction,
        roles: Role[],
        error: string, 
        identifier: User | boolean, 
        info: { message: string }
    ) {
        if(error) {
            console.error(error);
            response.status(HttpStatus.UNAUTHORIZED).send({
                message: info?.message
            });
            return;
        }

        if(identifier) {
            const user = identifier as User;
            console.log(`Authorising user '${user?.userName}' with role '${user.role}'`);

            // ensure user is specified in request
            request.user = user;
            
            // check the user has one of the required roles
            if(roles.includes(user.role)) {
                return next();
            }

            // insufficient privileges
            return response.status(HttpStatus.FORBIDDEN).send({
                message: 'Insufficient privileges'
            });
        }

        // the user was not logged in
        return response.status(HttpStatus.UNAUTHORIZED).send({
            message: info?.message
        });
    }

    private static initStrategies(auth: PassportAuth): void {
        this.initJWTStrategy(auth);
        this.initLocalStrategy();
    }

    private static initJWTStrategy(auth: PassportAuth): void {
        passport.use(
            'jwt',
            new JWTStrategy(
                {
                    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                    secretOrKey: Configuration.getAuth.secret
                },
                async (jwt, done) => {                    
                    try {
                        const user = await User.findOne({
                            attributes: [
                                'userId',
                                'userName',
                                'role'
                            ],
                            where: {
                                userId: jwt.userId
                            }
                        });

                        if(user) {
                            done(null, user);
                        } else {
                            done(null, false, { message: 'No user found for token'});
                        }
                    } catch(error) {
                        console.error(error);
                        done('An error occurred');
                    }
                }
            )
        );

        auth.app.post(
            `${Configuration.getExpress.root}/login`.replace('//', '/'),
            (request, response, next) => 
                passport.authenticate(
                    'local', 
                    (error: string, identifier: User | boolean, info: { message: string }) => 
                        auth.authenticate(request, response, error, identifier, info)
                )(request, response, next)
        );
    }

    private static initLocalStrategy(): void {
        passport.use(
            'local',
            new LocalStrategy(
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
    }
}

export default PassportAuth;
