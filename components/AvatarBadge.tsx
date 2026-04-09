import Image from "next/image";
import { getAvatarUrl } from "@/constants/avatars";
import { getTeamLogoUrl } from "@/constants/teams";

interface AvatarBadgeProps {
  avatar?: string | null;
  favoriteTeam?: string | null;
  size?: number;
}

export default function AvatarBadge({
  avatar,
  favoriteTeam,
  size = 16,
}: AvatarBadgeProps) {
  // Prefer avatar over favoriteTeam
  const avatarUrl = getAvatarUrl(avatar);

  if (avatarUrl) {
    const isHeadshot = avatar?.startsWith("player:");
    return (
      <Image
        src={avatarUrl}
        alt="avatar"
        width={size}
        height={size}
        className={`inline-block shrink-0 ${isHeadshot ? "rounded-full object-cover" : ""}`}
        title={avatar?.split(":")[1] ?? ""}
        unoptimized={avatarUrl.endsWith(".gif")}
      />
    );
  }

  // Fallback to favoriteTeam logo
  if (favoriteTeam) {
    const logoUrl = getTeamLogoUrl(favoriteTeam);
    if (!logoUrl) return null;
    return (
      <Image
        src={logoUrl}
        alt={favoriteTeam}
        width={size}
        height={size}
        className="inline-block shrink-0"
        title={favoriteTeam}
      />
    );
  }

  return null;
}
