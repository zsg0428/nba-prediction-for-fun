import { sendUnbidReminder } from "../lib/email";

async function main() {
  const to = process.argv[2] || "zsg258852@gmail.com";
  const fakeGames = [
    {
      homeTeam: "Boston Celtics",
      awayTeam: "New York Knicks",
      startTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
    },
    {
      homeTeam: "Denver Nuggets",
      awayTeam: "Los Angeles Lakers",
      startTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
    },
  ];

  console.log(`Sending test email to ${to}...`);
  const result = await sendUnbidReminder(to, "Dempsey", fakeGames);
  console.log("✅ Sent:", result);
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e);
    process.exit(1);
  });
