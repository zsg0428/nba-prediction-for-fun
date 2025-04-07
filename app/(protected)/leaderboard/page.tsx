import { getLeaderboard } from "@/actions/leaderboard";

export default async function LeaderboardPage() {
  const data = await getLeaderboard();

  return (
    <div className="mx-auto w-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">🏆 Leaderboard</h1>

      <ul className="space-y-4">
        {data.map((user, idx) => {
          console.log(user.image);
          return (
            <li
              key={user.userId}
              className="flex w-auto items-center justify-between rounded border bg-card p-4 shadow"
            >
              <div className="flex items-center gap-4">
                <img
                  src={
                    user.image ||
                    "https://imgs.search.brave.com/pWmdzuMxq0UZkB0zDV5N-JAHHYyV-yGm8AQSlxgH7Ho/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzAxLzdi/LzdlLzAxN2I3ZTE1/NmRhMDI3OThjNTRj/YWQ1NTU3OTE3MzFj/LmpwZw"
                  }
                  alt={user.name ?? "User"}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{user.name ?? user.email}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <p className="text-xl font-bold">{user.totalPoints} pts</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
