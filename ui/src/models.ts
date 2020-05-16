export interface Model {
    createdAt: Date;
    updatedAt: Date;
};

export interface Game extends Model {
    gameId: number;
    title: string;
};
