import HttpStatus, { getStatusText } from 'http-status-codes';
import mime from 'mime-types';
import { Response } from 'node-fetch';
import Queue from 'smart-request-balancer';

import Configuration from '../../config';
import IGDBRequestBuilder from './builder';

class Token {
    accessToken: string | undefined = undefined;
    expires: Date | undefined = undefined;
}

type QueryType = 'covers' | 'games' | 'platforms';

export default class IGDBService {
    private static readonly authUrl = 'https://id.twitch.tv/oauth2/token';
    private static readonly apiBaseUrl = 'https://api.igdb.com/v4';
    private static readonly imageBaseUrl = 'https://images.igdb.com/igdb/image/upload';

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

    public getCover = (gameId: number): IGDBRequestBuilder =>
        new IGDBRequestBuilder((body) => this.request('covers', body))
            .equal('game', gameId)

    public getGames = (id?: number, name?: string): IGDBRequestBuilder => {
        let builder = new IGDBRequestBuilder((body) => this.request('games', body));

        if(id) {
            builder = builder.equal('id', id);
        }

        if(name) {
            builder = builder.like('name', name);
        }

        return builder;
    }
    
    public getPlatforms = (name: string): IGDBRequestBuilder => 
        new IGDBRequestBuilder((body) => this.request('platforms', body))
            .like('name', name)
            .like('alternative_name', name)
            .like('abbreviation', name);
    
    public clearToken = (): void => this.token = undefined;

    public isEnabled = (): string => 
        Configuration.getIGDBClientCredentials?.id 
        && Configuration.getIGDBClientCredentials.secret;

    public getImageUrl(size: 'thumb' | 'cover', id: string): string {
        const sizeStr = 't_' + size === 'thumb' ? size : `${size}_big`;

        return `${IGDBService.imageBaseUrl}/t_${sizeStr}/${id}.jpg`;
    }

    private async request(type: QueryType, body?: string) {
        await this.authenticate();

        if(this.isEnabled()) {
            const url = `${IGDBService.apiBaseUrl}/${type}`;

            console.log(body);

            const response = await IGDBService.queue.request(async () => {
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
                        body,
                        compress: true,
                    }
                );
            }, '', 'igdb');

            return await this.checkForErrors(response);
        }

        return [];
    }

    public async authenticate(): Promise<Token | null> {
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
                    `${IGDBService.authUrl}?client_id=${clientCreds.id}&client_secret=${clientCreds.secret}&grant_type=client_credentials`,
                    { method: 'POST' }
                );

                const data = await this.checkForErrors(response);

                // calculate when the token expires, but 60s earlier to be sure
                const expires = new Date();
                expires.setSeconds(expires.getSeconds() + data.expires_in - 60);

                this.token = {
                    accessToken: data.access_token as string,
                    expires: expires
                };

                console.info('IGDB: Authenticated');

                return this.token;
            } catch(e) {
                throw new Error(`Failed to authenticate: ${e.message}`);
            }
        }

        return null;
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
}
