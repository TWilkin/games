import HttpStatus, { getStatusText } from 'http-status-codes';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';

interface GraphQLQueryOrMutation {
    __variables?: {
        [key: string]: string
    },
    [key: string]: any
}

export interface GraphQLQuery {
    query?: GraphQLQueryOrMutation,
    mutation?: GraphQLQueryOrMutation
}

export async function graphql(apiUrl: string, query: GraphQLQuery, variables={}): Promise<any> {
    const graphqlQuery = jsonToGraphQLQuery(query);

    const response = await fetch(`${apiUrl}/graphql`, {
        method: 'POST',
        credentials: 'include',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
            'query': graphqlQuery,
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

    return data;
}
