import HttpStatus, { getStatusText } from 'http-status-codes';

import { Model } from './models';

export const queries: { [name: string]: Query} = {
    'MyCollection': {
        name: 'GetGameCollection',
        query: 'query { GetGameCollection { gameCollectionId, gamePlatform { game { gameId, title }, platform { platformId, name } } } }'
    },
    'GameDetails': {
        name: 'GetGame',
        query: 'query($gameId: Int) { GetGame(gameId: $gameId) { gameId, title } }'
    }
};

export interface Query {
    name: string;
    query: string;
}

export default async function query<T extends Model>(apiUrl: string, query: Query, variables={}): Promise<T[]> {
    const response = await fetch(`${apiUrl}/graphql`, {
        method: 'POST',
        credentials: 'include',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
            'query': query.query,
            'variables': variables
        })
    });

    // check for unexpected status codes
    if(response.status != HttpStatus.OK) {
        throw new Error(getStatusText(response.status));
    }

    // check for errors
    const data = await response.json();
    if(data && data.errors) {
        throw new Error(JSON.stringify(data.errors));
    }

    // extract the response for the executed query
    return data.data[query.name];
}
