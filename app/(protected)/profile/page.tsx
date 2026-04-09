import { getCurrentUser } from "@/actions/user";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/Profile/ProfileForm";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
      <ProfileForm
        name={user.name ?? ""}
        favoriteTeam={user.favoriteTeam}
        avatar={user.avatar}
        emailReminders={user.emailReminders}
      />
    </main>
  );
}
