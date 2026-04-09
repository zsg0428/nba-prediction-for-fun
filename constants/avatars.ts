// Popular NBA player headshots from cdn.nba.com
// URL format: https://cdn.nba.com/headshots/nba/latest/1040x760/{playerId}.png

export interface PlayerAvatar {
  id: string; // playerId as string
  name: string;
  team: string;
}

export const FEATURED_PLAYERS: PlayerAvatar[] = [
  { id: "2544", name: "LeBron James", team: "Lakers" },
  { id: "201939", name: "Stephen Curry", team: "Warriors" },
  { id: "203999", name: "Nikola Jokic", team: "Nuggets" },
  { id: "1629029", name: "Luka Doncic", team: "Mavericks" },
  { id: "1628369", name: "Jayson Tatum", team: "Celtics" },
  { id: "203507", name: "Giannis Antetokounmpo", team: "Bucks" },
  { id: "201142", name: "Kevin Durant", team: "Suns" },
  { id: "203954", name: "Joel Embiid", team: "76ers" },
  { id: "1628983", name: "Shai Gilgeous-Alexander", team: "Thunder" },
  { id: "203076", name: "Anthony Davis", team: "Lakers" },
  { id: "1629630", name: "Ja Morant", team: "Grizzlies" },
  { id: "201935", name: "James Harden", team: "Clippers" },
  { id: "1630169", name: "Anthony Edwards", team: "Timberwolves" },
  { id: "1629627", name: "Zion Williamson", team: "Pelicans" },
  { id: "203081", name: "Damian Lillard", team: "Bucks" },
  { id: "1630162", name: "LaMelo Ball", team: "Hornets" },
  { id: "1631094", name: "Victor Wembanyama", team: "Spurs" },
  { id: "1628378", name: "Donovan Mitchell", team: "Cavaliers" },
  { id: "1630559", name: "Cade Cunningham", team: "Pistons" },
  { id: "203110", name: "Draymond Green", team: "Warriors" },
  { id: "1629631", name: "Tyler Herro", team: "Heat" },
  { id: "1628389", name: "Bam Adebayo", team: "Heat" },
  { id: "1630596", name: "Scottie Barnes", team: "Raptors" },
  { id: "203897", name: "Zach LaVine", team: "Bulls" },
  { id: "1629028", name: "Trae Young", team: "Hawks" },
  { id: "101108", name: "Chris Paul", team: "Spurs" },
  { id: "1630595", name: "Evan Mobley", team: "Cavaliers" },
  { id: "201566", name: "Derrick Rose", team: "Retired" },
  { id: "201950", name: "Jrue Holiday", team: "Celtics" },
  { id: "203468", name: "CJ McCollum", team: "Pelicans" },
];

export interface MemeAvatar {
  id: string;
  name: string;
  path: string; // relative path in /public
}

export const MEME_AVATARS: MemeAvatar[] = [
  // LeBron
  { id: "meme_lebron_goat", name: "LeBron GOAT", path: "/avatars/memes/LeBron_GOAT.png" },
  { id: "meme_lebron_jam1", name: "LeBron JAM", path: "/avatars/memes/LeBron_Jam1.gif" },
  { id: "meme_lebron_jam3", name: "LeBron JAM 2", path: "/avatars/memes/LeBron_Jam3.gif" },
  { id: "meme_lebron_what", name: "LeBron What", path: "/avatars/memes/LeBron_What.png" },
  { id: "meme_lebron_face", name: "LeBron Face", path: "/avatars/memes/LeBron_Face.png" },
  { id: "meme_lebron_shush", name: "LeBron Shush", path: "/avatars/memes/LeBron_Shush.png" },
  { id: "meme_lebron_demon", name: "LeBron Demon", path: "/avatars/memes/LeBron_DemonMode.png" },
  { id: "meme_lebron_turnt", name: "LeBron Turnt", path: "/avatars/memes/LeBron_Turnt.gif" },
  // Jokic
  { id: "meme_jokic_thinking", name: "Jokic Thinking", path: "/avatars/memes/Jokic_Thinking.png" },
  { id: "meme_jokic_hellno", name: "Jokic Hell No", path: "/avatars/memes/Jokic_HellNo.png" },
  { id: "meme_jokic_this", name: "Jokic This", path: "/avatars/memes/Jokic_This.png" },
  { id: "meme_jokic_clapping", name: "Jokic Clapping", path: "/avatars/memes/Jokic_Clapping.png" },
  { id: "meme_jokic_laughing", name: "Jokic Laughing", path: "/avatars/memes/Jokic_Laughing.png" },
  { id: "meme_jokic_deathstare", name: "Jokic Death Stare", path: "/avatars/memes/Jokic_DeathStare.png" },
  { id: "meme_jokic_surprised", name: "Jokic Surprised", path: "/avatars/memes/Jokic_Surprised.png" },
  { id: "meme_jokic_point", name: "Jokic Point", path: "/avatars/memes/Jokic_Point.png" },
  { id: "meme_jokic_blowkiss", name: "Jokic Blow Kiss", path: "/avatars/memes/Jokic_BlowKiss.png" },
  { id: "meme_jokic_glad", name: "Jokic Glad", path: "/avatars/memes/Jokic_Glad.png" },
  { id: "meme_jokic_huh", name: "Jokic Huh", path: "/avatars/memes/Jokic_HuhInteresting.png" },
  { id: "meme_jokic_lookingup", name: "Jokic Looking Up", path: "/avatars/memes/Jokic_LookingUp.png" },
  // Kobe
  { id: "meme_kobe_surprised", name: "Kobe Surprised", path: "/avatars/memes/Kobe_Surprised.png" },
  { id: "meme_kobe_stare", name: "Kobe Stare", path: "/avatars/memes/Kobe_Stare.png" },
  { id: "meme_kobe_fistpump", name: "Kobe Fist Pump", path: "/avatars/memes/Kobe_FistPump.png" },
  { id: "meme_kobe_mamba", name: "Kobe Mamba", path: "/avatars/memes/Kobe_Mamba.png" },
  { id: "meme_kobe_lakergang", name: "Kobe Lakers", path: "/avatars/memes/Kobe_LakerGang.gif" },
  { id: "meme_kobe_24", name: "Kobe 24", path: "/avatars/memes/Kobe_24.png" },
  // Curry
  { id: "meme_curry_dribble", name: "Curry Dribble", path: "/avatars/memes/Curry_Dribble.png" },
  { id: "meme_curry_celebration", name: "Curry Celebration", path: "/avatars/memes/Curry_Celebration.jpg" },
  // Luka
  { id: "meme_luka_stare", name: "Luka Stare", path: "/avatars/memes/Luka_Stare.jpg" },
  { id: "meme_luka_focus", name: "Luka Focus", path: "/avatars/memes/Luka_Focus.jpg" },
  // Jordan & Legends
  { id: "meme_jordan_face", name: "Jordan", path: "/avatars/memes/Jordan_Face.png" },
  { id: "meme_thegoat", name: "TheGOAT", path: "/avatars/memes/TheGOAT.png" },
  // Other
  { id: "meme_shaq_timeout", name: "Shaq Timeout", path: "/avatars/memes/Shaq_Timeout.png" },
  { id: "meme_confused_nick", name: "Confused Nick Young", path: "/avatars/memes/Confused_Nick_Young.png" },
  { id: "meme_pepe_ballin", name: "Pepe Ballin", path: "/avatars/memes/Pepe_Ballin.png" },
  { id: "meme_jesus_ballin", name: "Jesus Ballin", path: "/avatars/memes/Jesus_Ballin.png" },
  { id: "meme_basketball_cat", name: "Basketball Cat", path: "/avatars/memes/Basketball_Cat.gif" },
  { id: "meme_basketball_spin", name: "Basketball", path: "/avatars/memes/Basketball_Spin.gif" },
];

export function getPlayerHeadshotUrl(playerId: string): string {
  return `https://cdn.nba.com/headshots/nba/latest/1040x760/${playerId}.png`;
}

// Avatar value stored in DB as:
// - "player:{playerId}" for NBA headshots (e.g. "player:2544")
// - "meme:{memeId}" for meme avatars (e.g. "meme:meme_lebron_jam")
// - "team:{teamName}" for team logos (e.g. "team:Knicks")

export function getAvatarUrl(avatarValue: string | null | undefined): string | null {
  if (!avatarValue) return null;

  if (avatarValue.startsWith("player:")) {
    const playerId = avatarValue.slice(7);
    return getPlayerHeadshotUrl(playerId);
  }

  if (avatarValue.startsWith("meme:")) {
    const memeId = avatarValue.slice(5);
    const meme = MEME_AVATARS.find((m) => m.id === memeId);
    return meme?.path ?? null;
  }

  if (avatarValue.startsWith("team:")) {
    const teamName = avatarValue.slice(5);
    // Inline the logic to avoid circular imports
    const NBA_TEAM_IDS: Record<string, number> = {
      Hawks: 1610612737, Celtics: 1610612738, Nets: 1610612751,
      Hornets: 1610612766, Bulls: 1610612741, Cavaliers: 1610612739,
      Mavericks: 1610612742, Nuggets: 1610612743, Pistons: 1610612765,
      Warriors: 1610612744, Rockets: 1610612745, Pacers: 1610612754,
      Clippers: 1610612746, Lakers: 1610612747, Grizzlies: 1610612763,
      Heat: 1610612748, Bucks: 1610612749, Timberwolves: 1610612750,
      Pelicans: 1610612740, Knicks: 1610612752, Thunder: 1610612760,
      Magic: 1610612753, "76ers": 1610612755, Suns: 1610612756,
      "Trail Blazers": 1610612757, Kings: 1610612758, Spurs: 1610612759,
      Raptors: 1610612761, Jazz: 1610612762, Wizards: 1610612764,
    };
    const teamId = NBA_TEAM_IDS[teamName];
    if (teamId) return `https://cdn.nba.com/logos/nba/${teamId}/primary/L/logo.svg`;
  }

  return null;
}
