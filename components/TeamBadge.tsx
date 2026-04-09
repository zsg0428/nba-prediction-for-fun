import Image from "next/image";
import { getTeamLogoUrl } from "@/constants/teams";

interface TeamBadgeProps {
  teamName: string | null | undefined;
  size?: number;
}

export default function TeamBadge({ teamName, size = 16 }: TeamBadgeProps) {
  if (!teamName) return null;
  const logoUrl = getTeamLogoUrl(teamName);
  if (!logoUrl) return null;

  return (
    <Image
      src={logoUrl}
      alt={teamName}
      width={size}
      height={size}
      className="inline-block shrink-0"
      title={teamName}
    />
  );
}
