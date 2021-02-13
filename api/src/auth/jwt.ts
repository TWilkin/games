import { Request } from 'express';
import passport from 'passport';
import { ExtractJwt, JwtFromRequestFunction, Strategy } from 'passport-jwt';

import Configuration from '../config';
import User from '../models/user.model';
import PassportAuth from './passport-auth';

export default function jwt(): void {
    passport.use(
        'jwt',
        new Strategy(
            {
                jwtFromRequest: extractToken(),
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
}

function extractToken(): JwtFromRequestFunction {
    const bearerExtractor = ExtractJwt.fromAuthHeaderAsBearerToken();

    return (request: Request) => {
        // first try extracting an authorisation bearer
        let token = bearerExtractor(request);

        // next try a cookie
        if(!token) {
            token = request.cookies?.[PassportAuth.COOKIE_KEY];
        }

        return token;
    };
}
