import { useCallback, useEffect, useRef, useState } from 'react';

import { APISettings } from '../components/common';
import query, { mutate, Query } from '../graphql';
import { Model } from '../models';

export function useUpdatableQuery<TModel extends Model>(
    api: APISettings,
    graphqlQuery: Query, 
    variables={}
): { results: TModel[], setResults: React.Dispatch<React.SetStateAction<TModel[]>> }
{
    const [results, setResults] = useState<TModel[]>(undefined);

    useEffect(() => {
        (async () => {
            try {
                setResults(await query<TModel>(api.url, graphqlQuery, variables));
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
    graphqlQuery: Query, 
    variables={}
): TModel[]
{
    const { results } = useUpdatableQuery<TModel>(api, graphqlQuery, variables);
    return results;
}

export function useMutation<TModel extends Model>(
    api: APISettings,
    graphqlQuery: Query, 
    variables={},
    setResults?: React.Dispatch<React.SetStateAction<TModel[]>>
): () => Promise<void>
{
    const [isSending, setIsSending] = useState(false);
    const isMounted = useRef(true);

    const sendRequest = useCallback(async () => {
        if(isSending) {
            return;
        }

        try {
            setIsSending(true);
            const results = await mutate<TModel>(api.url, graphqlQuery, variables);

            if(setResults) {
                setResults([results]);
            }
        } catch(error) {
            api.onError(error);
        } finally {
            if(isMounted.current) {
                setIsSending(false);
            }
        }
    }, [isSending, ...Object.values(variables)]);

    return sendRequest;
}
