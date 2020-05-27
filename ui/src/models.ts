export type Models = 'Game' | 'GameCollection' | 'GameCompilation' | 'GamePlatform' | 'GamePlayTime' | 'Platform' | 'User';

export interface Model { };  

export interface Game extends Model {
    gameId: number;
    title: string;
    includes?: GameCompilation[];
};

export interface GameCollection extends Model {
    gameCollectionId: number;
    gamePlatform: GamePlatform;
};

export interface GameCompilation extends Model {
    gameCompilationId: number;
    primary: Game;
    included: Game;
}

export interface GamePlatform extends Model {
    gamePlatformId: number;
    alias?: string;
    game: Game;
    platform: Platform;
};

export interface GamePlayTime extends Model {
    gamePlayTimeId: number;
    gamePlatform: GamePlatform;
    gameCompilationId: number;
    demo: boolean;
    startTime: number;
    endTime?: number;
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
