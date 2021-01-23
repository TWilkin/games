import { useCallback, useEffect, useRef, useState } from 'react';
import { APISettings } from '../components/common';

import query, { mutate, Query } from '../graphql';
import { Model } from '../models';

export function useQuery<TModel extends Model>(
    api: APISettings,
    graphqlQuery: Query, 
    variables={}): TModel[]
{
    const [ results, setResults ] = useState<TModel[]>(undefined);

    useEffect(() => {
        (async () => {
            try {
                setResults(await query<TModel>(api.url, graphqlQuery, variables));
            } catch(error) {
                api.onError(error);
            }
        })();
    }, Object.keys(variables));

    return results;
}

export function useMutation<TModel extends Model>(
    api: APISettings,
    graphqlQuery: Query, 
    variables={}): () => Promise<TModel>
{
    const [ isSending, setIsSending ] = useState(false);
    const isMounted = useRef(true);

    const sendRequest = useCallback(async () => {
        if(isSending) {
            return;
        }

        try {
            setIsSending(true);
            return await mutate<TModel>(api.url, graphqlQuery, variables);
        } catch(error) {
            api.onError(error);
        } finally {
            if(isMounted.current) {
                setIsSending(false);
            }
        }
    }, [isSending, ...Object.keys(variables)]);

    return sendRequest;
}
