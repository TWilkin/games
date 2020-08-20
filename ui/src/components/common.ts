import { User } from '../models';

export interface APISettings {
    url: string;
    user: User | null;
    onError: (error: Error) => void;
};

export interface APIProps {
    api: APISettings;
};
