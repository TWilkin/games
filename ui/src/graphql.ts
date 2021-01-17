import HttpStatus, { getStatusText } from 'http-status-codes';

import { Model, Models } from './models';

const fragments: { [name in Models]: string } = {
    'Game': 'fragment GameFields on Game { gameId, title }',
    'GameCollection': 'fragment GameCollectionFields on GameCollection { gameCollectionId, gamePlatform { ...GamePlatformFields } }',
    'GameCompilation': 'fragment GameCompilationFields on GameCompilation { gameCompilationId, primary { ...GameFields }, included { ...GameFields } }',
    'GamePlatform': 'fragment GamePlatformFields on GamePlatform { gamePlatformId, alias, game { ...GameFields }, platform { ...PlatformFields } }',
    'GamePlayTime': 'fragment GamePlayTimeFields on GamePlayTime { gamePlayTimeId, gamePlatformId, gameCompilationId, demo, startTime, endTime }',
    'GameWishlist': 'fragment GameWishlistFields on GameWishlist { gameWishlistId, gamePlatform { ...GamePlatformFields } }',
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
        query: 'query($userId: Int, $gamePlatformId: Int) { GetGameCollection(userId: $userId, gamePlatformId: $gamePlatformId) { ...GameCollectionFields } }',
        fragments: [
            'Game',
            'GameCollection',
            'GamePlatform',
            'Platform'
        ]
    },
    'GameCompilation': {
        name: 'GetGameCompilation',
        query: 'query($primaryGameId: Int) { GetGameCompilation(primaryGameId: $primaryGameId) { ...GameCompilationFields } }',
        fragments: [
            'Game',
            'GameCompilation'
        ]
    },
    'GamePlatform': {
        name: 'GetGamePlatform',
        query: 'query($gamePlatformId: Int, $platformId: Int) { GetGamePlatform(gamePlatformId: $gamePlatformId, platformId: $platformId) { ...GamePlatformFields } }',
        fragments: [
            'Game',
            'GamePlatform',
            'Platform'
        ]
    },
    'GamePlayTime': {
        name: 'GetGamePlayTime',
        query: 'query($gamePlatformId: Int, $userId: Int, $endTime: DateTime) { GetGamePlayTime(gamePlatformId: $gamePlatformId, userId: $userId, endTime: $endTime) { ...GamePlayTimeFields } }',
        fragments: [ 'GamePlayTime' ]
    },
    'GameWishlist': {
        name: 'GetGameWishlist',
        query: 'query($userId: Int, $gamePlatformId: Int) { GetGameWishlist(userId: $userId, gamePlatformId: $gamePlatformId) { ...GameWishlistFields } }',
        fragments: [
            'Game',
            'GamePlatform',
            'GameWishlist',
            'Platform'
        ]
    },
    'Platform': {
        name: 'GetPlatform',
        query: 'query { GetPlatform { ...PlatformFields } }',
        fragments: [ 'Platform' ]
    },
    'User': null
};

export const mutations: { [key in 'add'|'update']: { [name: string]: Query }} = {
    'add': {
        'GameCollection': {
            name: 'AddGameCollection',
            query: 'mutation($input: GameCollectionInput!) { AddGameCollection(input: $input) { ...GameCollectionFields } }',
            fragments: [
                'Game',
                'GameCollection',
                'GamePlatform',
                'Platform'
            ]
        },
        'GamePlayTime': {
            name: 'AddGamePlayTime',
            query: 'mutation($input: GamePlayTimeInput!) { AddGamePlayTime(input: $input) { ...GamePlayTimeFields } }',
            fragments: [ 'GamePlayTime' ]
        },
        'GameWishlist': {
            name: 'AddGameWishlist',
            query: 'mutation($input: GameWishlistInput!) { AddGameWishlist(input: $input) { ...GameWishlistFields } }',
            fragments: [
                'Game',
                'GamePlatform',
                'GameWishlist',
                'Platform'
            ]
        }
    },
    'update': {
        'GamePlayTime': {
            name: 'UpdateGamePlayTime',
            query: 'mutation($id: Int!, $input: GamePlayTimeInput!) { UpdateGamePlayTime(id: $id, input: $input) { ...GamePlayTimeFields } }',
            fragments: [ 'GamePlayTime' ]
        }
    }
};

export interface Query {
    name: string;
    query: string;
    fragments: Models[];
}

async function graphql(apiUrl: string, query: Query, variables: object): Promise<any> {
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
}

export default function query<T extends Model>(apiUrl: string, query: Query, variables={}): Promise<T[]> {
    return graphql(apiUrl, query, variables);
};

export function mutate<T extends Model>(apiUrl: string, mutation: Query, variables: object): Promise<T> {
    return graphql(apiUrl, mutation, variables);
};
