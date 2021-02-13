import cookieParser from 'cookie-parser';
import { Express, NextFunction, Request, RequestHandler, Response } from 'express';
import HttpStatus from 'http-status-codes';
import jsonwebtoken from 'jsonwebtoken';
import passport from 'passport';

import Configuration from '../config';
import User, { Role } from '../models/user.model';
import JWTStrategy from './jwt';
import LocalStrategy from './local';

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
    // the JWT cookie identifier
    public static COOKIE_KEY = 'jwt';

    // the expiry length
    private static EXPIRY = 24 * 60 * 1000;

    public requireUserRole = this.requireRoles;

    public requireAdminRole = (): RequestHandler => this.requireRoles(['admin']);

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
        const auth = new PassportAuth();

        app.use(cookieParser());
        app.use(passport.initialize());

        JWTStrategy();
        LocalStrategy(auth, app);

        return auth;
    }

    public async authenticate(
        request: Request,
        response: Response,
        error: string, 
        identifier: User | boolean, 
        info: { message: string }
    ): Promise<void> {
        if(error) {
            console.error(error);
            response.status(HttpStatus.UNAUTHORIZED).send();
            return;
        }

        if(identifier) {
            request.logIn(identifier, () => {
                const user = identifier as User;
                console.log(`Authenticating user '${user?.userName}'`);

                const token = jsonwebtoken.sign(
                    { 
                        userId: user.userId,
                        userName: user.userName,
                        role: user.role
                    },
                    Configuration.getAuth.secret,
                    { expiresIn: PassportAuth.EXPIRY }
                );

                response.status(HttpStatus.OK)
                    .cookie(
                        PassportAuth.COOKIE_KEY,
                        token,
                        {
                            secure: Configuration.getAuth.secureCookie,
                            httpOnly: false,
                            sameSite: true
                        }
                    ).send({
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
}

export default PassportAuth;
