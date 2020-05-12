import { plainToClass } from 'class-transformer';
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

    // the JWT RequestHandler
    private handler: jwt.RequestHandler;

    constructor() {
        this.handler = jwt({
            secret: Configuration.getJWTSecret,
            credentialsRequired: true,
            requestProperty: 'user'
        });
    }

    public get getHandlers(): RequestHandler[] {
        return [
            this.handler,
            this.authorise
        ];
    }

    private authorise(req: Request<any>, res: Response<any>, next: NextFunction) {
        // check the user is logged in
        const authReq = req as AuthenticatedRequest;
        if(authReq.user && authReq.user.userId && authReq.user.role) {
            console.log(`Authorised ${authReq.user.userName} as ${authReq.user.role}`);

            // ensure the user is a User type
            authReq.user = plainToClass(User, authReq.user);

            return next();
        }
        
        return res.sendStatus(HttpStatus.UNAUTHORIZED);
    }

    private async authenticate(req: Request<any>, res: Response<any>): Promise<any> {
        const user = await User.authenticate(req.body.userName, req.body.password);
        if(user) {
            const token = jsonwebtoken.sign(
                { 
                    userId: user.userId, 
                    userName: user.userName,
                    role: user.role
                },
                Configuration.getJWTSecret,
                { expiresIn: '1d' }
            );
            res.status(HttpStatus.OK);
            res.json({ token: token });
        } else {
            res.status(HttpStatus.FORBIDDEN);
            res.json({ error: 'login failed' });
        }
    }

    public static init(app: Express): Auth {
        const auth = new Auth();

        // add the login route
        app.post(
            `${Configuration.getExpress.root}/login`.replace('//', '/'),
            auth.authenticate
        );

        return auth;
    }

}
