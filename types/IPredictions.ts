export type Prediction = {
  user: string | null;
  predictedTeam: string;
};

export type PredictionMap = {
  [apiGameId: number]: Prediction[];
};