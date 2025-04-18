export type Game = {
    id: number;
    datetime: string;
    status: string;
    home_team: { name: string };
    home_team_score: number;
    visitor_team: { name: string };
    visitor_team_score: number;
    round: string;
};