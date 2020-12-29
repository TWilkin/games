import cookieParser from 'cookie-parser';
import { Express, Request, RequestHandler, Response, NextFunction } from 'express';
import jwt from 'express-jwt';
import HttpStatus from 'http-status-codes';
import jsonwebtoken from 'jsonwebtoken';

import Configuration from '../config';
import User from '../models/user.model';

// interface for the extra property in an authenticated request
export interface AuthenticatedRequest {

    // the user retrieved from the header
    user?: {
        userId: number,
        userName: string,
        role: 'admin' | 'user'
    };

}

export default class Auth {

    // the JWT cookie identifier
    private static COOKIE_KEY = 'jwt';

    // the expiry length
    private static EXPIRY = 24 * 60 * 1000;

    // the JWT RequestHandler
    private handler: jwt.RequestHandler;

    constructor() {
        this.handler = jwt({
            secret: Configuration.getAuth.secret,
            credentialsRequired: true,
            requestProperty: 'user',
            getToken: this.getToken,
            algorithms: ['HS256']
        });
    }

    public get getHandlers(): RequestHandler[] {
        return [
            this.handler,
            this.authorise
        ];
    }

    private getToken(req: Request<any>): string | null {
        // read from the authorization header
        const split = req.headers.authorization?.split(' ');
        if(split && split.length == 2 && split[0] == 'Bearer') {
            return split[1];
        } else if(req.cookies && req.cookies[Auth.COOKIE_KEY]) {
            // read from a cookie
            return req.cookies[Auth.COOKIE_KEY];
        }

        // no authorisation
        return null;
    }

    private authorise(req: Request<any>, res: Response<any>, next: NextFunction) {
        // check the user is logged in
        const authReq = req as AuthenticatedRequest;
        if(authReq.user && authReq.user.userId && authReq.user.role) {
            console.log(`Authorised ${authReq.user.userName} as ${authReq.user.role}`);

            // ensure the user is a User type
            let user = new User();
            user.userId = authReq.user.userId;
            user.userName = authReq.user.userName;
            user.role = authReq.user.role;

            return next();
        }
        
        return res.sendStatus(HttpStatus.UNAUTHORIZED);
    }

    private async authenticate(req: Request<any>, res: Response<any>): Promise<any> {
        const user = await User.authenticate(req.body.userName, req.body.password);
        if(user) {
            // create the JWT token
            const token = jsonwebtoken.sign(
                { 
                    userId: user.userId, 
                    userName: user.userName,
                    role: user.role
                },
                Configuration.getAuth.secret,
                { expiresIn: Auth.EXPIRY }
            );

            // return the JWT in a cookie
            res.status(HttpStatus.OK)
                .cookie(
                    Auth.COOKIE_KEY, 
                    token, 
                    {
                        secure: Configuration.getAuth.secureCookie,
                        httpOnly: false,
                        sameSite: true
                    }
                )
                .send();
        } else {
            // send an authentication error
            res.status(HttpStatus.FORBIDDEN)
                .json({ error: 'login failed' });
        }
    }

    public static init(app: Express): Auth {
        const auth = new Auth();
        app.use(cookieParser());

        // add the login route
        app.post(
            `${Configuration.getExpress.root}/login`.replace('//', '/'),
            auth.authenticate
        );

        return auth;
    }

}
