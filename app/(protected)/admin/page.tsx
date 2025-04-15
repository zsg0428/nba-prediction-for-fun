import Link from "next/link";
import { getCurrentUser } from "@/actions/user";
import { Role } from "@prisma/client";

import { Button } from "@/components/ui/button";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (user?.role !== Role.ADMIN) {
    return (
      <div>
        <span>You have no access to the admin page</span>
        <Link href="/">
          <Button variant="outline">Go back to homepage</Button>
        </Link>
      </div>
    );
  }

  return <div>Admin page</div>;
}
