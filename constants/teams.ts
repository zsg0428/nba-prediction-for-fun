// NBA team name → logo URL mapping
// Logo source: cdn.nba.com (official NBA CDN)

const NBA_TEAM_IDS: Record<string, number> = {
  Hawks: 1610612737,
  Celtics: 1610612738,
  Nets: 1610612751,
  Hornets: 1610612766,
  Bulls: 1610612741,
  Cavaliers: 1610612739,
  Mavericks: 1610612742,
  Nuggets: 1610612743,
  Pistons: 1610612765,
  Warriors: 1610612744,
  Rockets: 1610612745,
  Pacers: 1610612754,
  Clippers: 1610612746,
  Lakers: 1610612747,
  Grizzlies: 1610612763,
  Heat: 1610612748,
  Bucks: 1610612749,
  Timberwolves: 1610612750,
  Pelicans: 1610612740,
  Knicks: 1610612752,
  Thunder: 1610612760,
  Magic: 1610612753,
  "76ers": 1610612755,
  Suns: 1610612756,
  "Trail Blazers": 1610612757,
  Kings: 1610612758,
  Spurs: 1610612759,
  Raptors: 1610612761,
  Jazz: 1610612762,
  Wizards: 1610612764,
};

export const NBA_TEAM_NAMES = Object.keys(NBA_TEAM_IDS);

export function getTeamLogoUrl(teamName: string): string {
  const teamId = NBA_TEAM_IDS[teamName];
  if (!teamId) return "";
  return `https://cdn.nba.com/logos/nba/${teamId}/primary/L/logo.svg`;
}
