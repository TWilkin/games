import config from 'config';
import { Express, Request, Response } from 'express';
import jwt from 'express-jwt';
import HttpStatus from 'http-status-codes';
import jsonwebtoken from 'jsonwebtoken';

import User from '../models/user';

export default class Auth {

    // the JWT RequestHandler
    private handler: jwt.RequestHandler;

    constructor() {
        this.handler = jwt({
            secret: Auth.getSecret,
            credentialsRequired: false
        });
    }

    private static get getSecret(): string {
        return config.get('jwt_secret');
    }

    private async login(req: Request<any>, res: Response<any>): Promise<any> {
        const user = await User.login(req.body.userName, req.body.password);
        if(user) {
            const token = jsonwebtoken.sign(
                { id: user.userId, userName: user.userName },
                Auth.getSecret,
                { expiresIn: '1d' }
            );
            res.status(HttpStatus.OK);
            res.json({ token: token });
        } else {
            res.status(HttpStatus.FORBIDDEN);
            res.json({ error: 'login failed' });
        }
    }

    public static init(app: Express, root: string): Auth {
        const auth = new Auth();

        // add the login route
        app.post(
            `${root}/login`.replace('//', '/'),
            auth.login
        );

        return auth;
    }

}
