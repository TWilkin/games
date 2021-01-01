import HttpStatus, { getStatusText } from 'http-status-codes';
import mime from 'mime-types';
import { Response } from 'node-fetch';
import Queue from 'smart-request-balancer';

import Configuration from '../../config';

class Token {
    accessToken: string | undefined = undefined;
    expires: Date | undefined = undefined;
}

type QueryType = 'games' | 'platforms';

export default class IGDB {
    private static readonly authUrl = "https://id.twitch.tv/oauth2/token";
    private static readonly baseUrl = "https://api.igdb.com/v4";

    // rate limit to 4 requests per second
    private static queue = new Queue({
        rules: {
            igdb: {
                rate: 4,
                limit: 1,
                priority: 1
            }
        }
    });

    private token: Token | undefined = undefined;

    public getGames = () => this.request('games');
    
    public getPlatforms = () => this.request('platforms');

    public clearToken = () => this.token = undefined;

    public isEnabled = () => 
        Configuration.getIGDBClientCredentials?.id 
        && Configuration.getIGDBClientCredentials.secret;

    private async request(type: QueryType) {
        await this.authenticate();

        if(this.isEnabled()) {
            const url = `${IGDB.baseUrl}/${type}`;

            const response = await IGDB.queue.request(async () => {
                console.info(`IGDB: Querying ${url}`);
                return await globalThis.fetch(
                    url, { 
                        method: 'POST',
                        headers: {
                            'Client-ID': Configuration.getIGDBClientCredentials.id,
                            'Authorization': `Bearer ${this.token?.accessToken}`,
                            'User-Agent': Configuration.getUserAgent,
                            'Content-Type': (mime.lookup('txt') ?? '') as string,
                            'Accept': (mime.lookup('json') ?? '') as string
                        },
                        body: 'fields *; limit 20;',
                        compress: true,
                    }
                );
            }, '', 'igdb');

            return await this.checkForErrors(response);
        }

        return [];
    }

    public async authenticate() {
        // check if we have an in-date token
        if(this.token?.expires && new Date() < this.token.expires) {
            // token is valid
            console.info('IGDB: Re-using token');
            return this.token;
        }

        // only request a token if the service is enabled
        if(this.isEnabled()) {
            // request a new token
            try {
                const clientCreds = Configuration.getIGDBClientCredentials;

                const response = await globalThis.fetch(
                    `${IGDB.authUrl}?client_id=${clientCreds.id}&client_secret=${clientCreds.secret}&grant_type=client_credentials`,
                    { method: 'POST' }
                );

                let data = await this.checkForErrors(response);

                // calculate when the token expires, but 60s earlier to be sure
                let expires = new Date();
                expires.setSeconds(expires.getSeconds() + data.expires_in - 60);

                this.token = {
                    accessToken: data.access_token as string,
                    expires: expires
                };

                console.info('IGDB: Authenticated');
            } catch(e) {
                throw new Error(`Failed to authenticate: ${e.message}`);
            }
        }
    }

    private async checkForErrors(response: Response) {
        if(response.status != HttpStatus.OK) {
            throw new Error(getStatusText(response.status));
        }

        const data = await response.json();
        if(data?.errors) {
            throw new Error(JSON.stringify(data.errors));
        }

        return data;
    }
};
