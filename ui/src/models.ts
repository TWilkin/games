export type Models = 'Game' | 'GameCollection' | 'GameCompilation' | 'GamePlatform' | 'GamePlayTime' | 'GameWishlist' | 'Platform' | 'User';

export interface Model {
    createdAt: Date;
    updatedAt: Date;
}

export interface Game extends Model {
    gameId: number;
    igdbId: number;
    title: string;
    includes?: GameCompilation[];
}

export interface GameCollection extends UserGamePlatform {
    gameCollectionId: number;
}

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
}

export interface GamePlayTime extends Model {
    gamePlayTimeId: number;
    gamePlatform: GamePlatform;
    gameCompilationId: number;
    demo: boolean;
    startTime: number;
    endTime?: number;
}

export interface GameWishlist extends UserGamePlatform {
    gameWishlistId: number;
    gamePlatform: GamePlatform;
}

export interface Platform extends Model {
    platformId: number;
    name: string;
}

export interface User extends Model {
    userId: number;
    userName: string;
    role: string;
}

export interface UserGamePlatform extends Model {
    gamePlatform: GamePlatform;
}

export interface IGDBGame extends Model {
    id: number;
    name: string;
    platforms?: Platform[];
    url: string;
}
