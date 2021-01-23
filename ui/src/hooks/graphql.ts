import { useEffect, useState } from 'react';
import { APISettings } from '../components/common';

import query, { Query } from '../graphql';
import { Model } from '../models';

export function useQuery<TModel extends Model>(
    api: APISettings,
    graphqlQuery: Query, 
    variables={},
    props: any[]=[]): TModel[]
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
    }, props);

    return results;
}
