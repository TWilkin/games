import { RouteComponentProps } from 'react-router-dom';

import { User } from '../models';

export interface APISettings {
    url: string;
    user: User | null;
    onError: (error: Error) => void;
}

export interface APIProps {
    api: APISettings;
}

export interface UserProps {
    user?: User;
}

export interface UserRouteMatch {
    userId: string;
}

export interface UserRouteProps extends APIProps, RouteComponentProps<UserRouteMatch> { }
