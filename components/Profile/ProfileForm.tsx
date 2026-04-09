"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, X, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateUserProfile } from "@/actions/user";
import { NBA_TEAM_NAMES, getTeamLogoUrl } from "@/constants/teams";
import {
  FEATURED_PLAYERS,
  MEME_AVATARS,
  getPlayerHeadshotUrl,
} from "@/constants/avatars";
import allPlayersData from "@/constants/all-players.json";

type AllPlayer = { id: string; firstName: string; lastName: string };

type AvatarTab = "teams" | "players" | "memes";

interface ProfileFormProps {
  name: string;
  favoriteTeam: string | null;
  avatar: string | null;
  emailReminders: boolean;
}

export default function ProfileForm({
  name: initialName,
  favoriteTeam: initialFavoriteTeam,
  avatar: initialAvatar,
}: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [favoriteTeam, setFavoriteTeam] = useState<string | null>(
    initialFavoriteTeam,
  );
  const [avatar, setAvatar] = useState<string | null>(initialAvatar);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<AvatarTab>("players");
  const [playerSearch, setPlayerSearch] = useState("");
  const router = useRouter();

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile({
        name: name.trim(),
        favoriteTeam,
        avatar,
      });
      toast.success("Profile updated!");
      router.refresh();
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    name !== initialName ||
    favoriteTeam !== initialFavoriteTeam ||
    avatar !== initialAvatar;

  const allPlayers = allPlayersData as AllPlayer[];

  const filteredPlayers: { id: string; name: string; team?: string }[] =
    playerSearch.length >= 2
      ? allPlayers
          .filter((p) => {
            const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
            return fullName.includes(playerSearch.toLowerCase());
          })
          .slice(0, 30)
          .map((p) => ({
            id: p.id,
            name: `${p.firstName} ${p.lastName}`,
          }))
      : FEATURED_PLAYERS;

  const selectAvatar = (value: string) => {
    setAvatar(avatar === value ? null : value);
  };

  return (
    <div className="space-y-6">
      {/* Display Name */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Display Name</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="name" className="sr-only">
            Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your display name"
            className="max-w-sm"
          />
        </CardContent>
      </Card>

      {/* Favorite Team */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Favorite Team</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6">
            {NBA_TEAM_NAMES.map((team) => {
              const isSelected = favoriteTeam === team;
              const logoUrl = getTeamLogoUrl(team);
              return (
                <button
                  key={team}
                  onClick={() => setFavoriteTeam(isSelected ? null : team)}
                  className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-md shadow-primary/20"
                      : "border-transparent bg-muted/50 hover:border-border hover:bg-muted"
                  }`}
                >
                  {logoUrl && (
                    <Image
                      src={logoUrl}
                      alt={team}
                      width={36}
                      height={36}
                      className="drop-shadow-sm"
                    />
                  )}
                  <span className="text-[11px] font-medium leading-tight">
                    {team}
                  </span>
                </button>
              );
            })}
          </div>
          {favoriteTeam && (
            <button
              onClick={() => setFavoriteTeam(null)}
              className="mt-3 flex cursor-pointer items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Clear selection
            </button>
          )}
        </CardContent>
      </Card>

      {/* Avatar / Badge */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Avatar Badge</CardTitle>
          <p className="text-sm text-muted-foreground">
            This badge appears next to your name across the app.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {(
              [
                { key: "players", label: "Players" },
                { key: "memes", label: "Memes" },
                { key: "teams", label: "Teams" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Players Tab */}
          {activeTab === "players" && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search players..."
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6">
                {filteredPlayers.map((player) => {
                  const value = `player:${player.id}`;
                  const isSelected = avatar === value;
                  return (
                    <button
                      key={player.id}
                      onClick={() => selectAvatar(value)}
                      className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-md shadow-primary/20"
                          : "border-transparent bg-muted/50 hover:border-border hover:bg-muted"
                      }`}
                    >
                      <Image
                        src={getPlayerHeadshotUrl(player.id)}
                        alt={player.name}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                      <span className="text-center text-[10px] font-medium leading-tight">
                        {player.name.split(" ").pop()}
                      </span>
                    </button>
                  );
                })}
              </div>
              {filteredPlayers.length === 0 && playerSearch.length >= 2 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No players found for &quot;{playerSearch}&quot;
                </p>
              )}
              {playerSearch.length === 1 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Type at least 2 characters to search all 500+ players
                </p>
              )}
            </div>
          )}

          {/* Memes Tab */}
          {activeTab === "memes" && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6">
              {MEME_AVATARS.map((meme) => {
                const value = `meme:${meme.id}`;
                const isSelected = avatar === value;
                return (
                  <button
                    key={meme.id}
                    onClick={() => selectAvatar(value)}
                    className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-md shadow-primary/20"
                        : "border-transparent bg-muted/50 hover:border-border hover:bg-muted"
                    }`}
                  >
                    <Image
                      src={meme.path}
                      alt={meme.name}
                      width={40}
                      height={40}
                      className="rounded-lg"
                      unoptimized={meme.path.endsWith(".gif")}
                    />
                    <span className="text-[10px] font-medium leading-tight">
                      {meme.name}
                    </span>
                  </button>
                );
              })}
              {MEME_AVATARS.length === 0 && (
                <p className="col-span-full py-4 text-center text-sm text-muted-foreground">
                  No memes available yet
                </p>
              )}
            </div>
          )}

          {/* Teams Tab */}
          {activeTab === "teams" && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6">
              {NBA_TEAM_NAMES.map((team) => {
                const value = `team:${team}`;
                const isSelected = avatar === value;
                const logoUrl = getTeamLogoUrl(team);
                return (
                  <button
                    key={team}
                    onClick={() => selectAvatar(value)}
                    className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-md shadow-primary/20"
                        : "border-transparent bg-muted/50 hover:border-border hover:bg-muted"
                    }`}
                  >
                    {logoUrl && (
                      <Image
                        src={logoUrl}
                        alt={team}
                        width={36}
                        height={36}
                        className="drop-shadow-sm"
                      />
                    )}
                    <span className="text-[11px] font-medium leading-tight">
                      {team}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {avatar && (
            <button
              onClick={() => setAvatar(null)}
              className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Clear avatar
            </button>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={!hasChanges || saving}
        className="cursor-pointer"
      >
        <Save className="mr-2 h-4 w-4" />
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
