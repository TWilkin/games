export type Models = 'Game' | 'GameCollection' | 'GamePlatform' | 'Platform' | 'User';

export interface Model {
    createdAt: Date;
    updatedAt: Date;
};

export interface Game extends Model {
    gameId: number;
    title: string;
};

export interface GameCollection extends Model {
    gameCollectionId: number;
    gamePlatform: GamePlatform;
};

export interface GamePlatform extends Model {
    gamePlatformId: number;
    game: Game;
    platform: Platform;
};

export interface Platform extends Model {
    platformId: number;
    name: string;
};

export interface User extends Model {
    userId: number;
    userName: string;
    role: string;
};
