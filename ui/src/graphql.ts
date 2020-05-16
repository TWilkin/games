import HttpStatus, { getStatusText } from 'http-status-codes';

export const queries: { [name: string]: Query} = {
    'GameDetails': {
        name: 'GetGame',
        query: 'query { GetGame { title } }'
    }
};

export interface Query {
    name: string;
    query: string;
}

export default async function query(apiUrl: string, query: Query): Promise<any[]> {
    const response = await fetch(`${apiUrl}/graphql`, {
        method: 'POST',
        credentials: 'include',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
            'query': query.query
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
