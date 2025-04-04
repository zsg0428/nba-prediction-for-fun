import Link from "next/link";

import { Button } from "@/components/ui/button";

export const SignoutButton = () => {
  return (
    <Link href="/api/auth/signout">
      <Button variant="outline" className="cursor-pointer">
        Sign Out
      </Button>
    </Link>
  );
};
