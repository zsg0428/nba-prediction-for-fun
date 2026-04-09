export type Prediction = {
  user: string | null;
  predictedTeam: string;
  favoriteTeam?: string | null;
  avatar?: string | null;
};

export type PredictionMap = {
  [apiGameId: number]: Prediction[];
};