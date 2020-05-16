import HttpStatus, { getStatusText } from 'http-status-codes';

import { Model, Models } from './models';

const fragments: { [name in Models]: string } = {
    'Game': 'fragment GameFields on Game { gameId, title }',
    'GameCollection': 'fragment GameCollectionFields on GameCollection { gameCollectionId, gamePlatform { ...GamePlatformFields } }',
    'GamePlatform': 'fragment GamePlatformFields on GamePlatform { gamePlatformId, game { ...GameFields }, platform { ...PlatformFields } }',
    'Platform': 'fragment PlatformFields on Platform { platformId, name }',
    'User': 'fragment UserFields on User { userId, userName }'
};

export const queries: { [name in Models]: Query | null} = {
    'Game': {
        name: 'GetGame',
        query: 'query($gameId: Int) { GetGame(gameId: $gameId) { ...GameFields } }',
        fragments: [ 'Game' ]
    },
    'GameCollection': {
        name: 'GetGameCollection',
        query: 'query($userId: Int) { GetGameCollection(userId: $userId) { ...GameCollectionFields } }',
        fragments: [
            'Game',
            'GameCollection',
            'GamePlatform',
            'Platform'
        ]
    },
    'GamePlatform': null,
    'Platform': null,
    'User': null
};

interface Query {
    name: string;
    query: string;
    fragments: Models[];
}

export default async function query<T extends Model>(apiUrl: string, query: Query, variables={}): Promise<T[]> {
    const response = await fetch(`${apiUrl}/graphql`, {
        method: 'POST',
        credentials: 'include',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
            'query': `${query.query} ${query.fragments.map(f => fragments[f]).join(' ')}`,
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
};
