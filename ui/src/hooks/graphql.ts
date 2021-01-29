import { useCallback, useEffect, useRef, useState } from 'react';

import { APISettings } from '../components/common';
import { graphql, GraphQLQuery } from '../graphql';
import { Model } from '../models';

export function useUpdatableQuery<TModel extends Model>(
    api: APISettings,
    query: GraphQLQuery,
    variables={}
): { results: TModel[], setResults: React.Dispatch<React.SetStateAction<TModel[]>> }
{
    const [results, setResults] = useState<TModel[]>(undefined);

    const queryName = getQueryName(query);

    useEffect(() => {
        (async () => {
            try {
                const result = await graphql(api.url, query, variables);
                setResults(result.data[queryName] as unknown as TModel[]);
            } catch(error) {
                api.onError(error);
            }
        })();
    }, Object.values(variables));

    return {
        results,
        setResults
    };
}

export function useQuery<TModel extends Model>(
    api: APISettings,
    query: GraphQLQuery,
    variables={}
): TModel[]
{
    const { results } = useUpdatableQuery<TModel>(api, query, variables);
    return results;
}

export function useMutation<TModel extends Model>(
    api: APISettings,
    query: GraphQLQuery,
    variables={},
    setResults?: React.Dispatch<React.SetStateAction<TModel[]>>
): () => Promise<TModel>
{
    const [isSending, setIsSending] = useState(false);
    const isMounted = useRef(true);

    const queryName = getQueryName(query);

    const sendRequest = useCallback(async () => {
        if(isSending) {
            return;
        }

        try {
            setIsSending(true);
            const results = await graphql(api.url, query, variables);
            const result = results.data[queryName] as unknown as TModel;

            if(setResults) {
                setResults([result]);
            }

            return result;
        } catch(error) {
            api.onError(error);
        } finally {
            if(isMounted.current) {
                setIsSending(false);
            }
        }
    }, [
        isSending, 
        ...Object.values(variables)
    ]);

    return sendRequest;
}

function getQueryName(query: GraphQLQuery) {
    return Object.keys(query.query ?? query.mutation)
        .filter(key => key !== '__variables')[0];
}
