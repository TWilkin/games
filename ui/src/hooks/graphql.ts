import { useEffect } from 'react';
import { APISettings } from '../components/common';

import query, { Query } from '../graphql';
import { Model } from '../models';

export function useQuery<TModel extends Model>(
    api: APISettings,
    onLoad: (data: TModel[]) => void, 
    graphqlQuery: Query, 
    variables={},
    props: any[]=[]): void
{
    useEffect(() => {
        (async () => {
            try {
                const result = await query<TModel>(api.url, graphqlQuery, variables);
                onLoad(result);
            } catch(error) {
                api.onError(error);
            }
        })();
    }, props);
}
