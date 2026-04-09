import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = "NBA Predictor <onboarding@resend.dev>";

interface UnbidGame {
  homeTeam: string;
  awayTeam: string;
  startTime: Date;
}

export const sendUnbidReminder = async (
  to: string,
  userName: string,
  unbidGames: UnbidGame[],
) => {
  const gameRows = unbidGames
    .map((g) => {
      const time = g.startTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/New_York",
      });
      return `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
            <strong>${g.awayTeam}</strong> @ <strong>${g.homeTeam}</strong>
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #6b7280;">
            ${time} ET
          </td>
        </tr>`;
    })
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 24px; text-align: center;">
      <h1 style="margin: 0; color: #f97316; font-size: 22px; font-weight: 700;">NBA Predictor</h1>
      <p style="margin: 8px 0 0; color: #94a3b8; font-size: 14px;">Game Day Reminder</p>
    </div>

    <!-- Body -->
    <div style="padding: 24px;">
      <p style="margin: 0 0 16px; color: #1f2937; font-size: 16px;">
        Hey ${userName || "there"},
      </p>
      <p style="margin: 0 0 20px; color: #4b5563; font-size: 14px; line-height: 1.6;">
        You have <strong>${unbidGames.length} game${unbidGames.length > 1 ? "s" : ""}</strong> today that you haven't predicted yet. Make sure to lock in your picks before tip-off — once a game starts, predictions are locked!
      </p>

      <!-- Games Table -->
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background: #f9fafb;">
            <th style="padding: 10px 16px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Matchup</th>
            <th style="padding: 10px 16px; text-align: right; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Time</th>
          </tr>
        </thead>
        <tbody>
          ${gameRows}
        </tbody>
      </table>

      <!-- CTA Button -->
      <div style="text-align: center; margin-top: 24px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://nba-prediction-for-fun.vercel.app"}/predictions"
           style="display: inline-block; background: #f97316; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
          Make Your Picks
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding: 16px 24px; background: #f9fafb; text-align: center;">
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
        You're receiving this because you have email reminders enabled.
        Log in to your account to change notification preferences.
      </p>
    </div>
  </div>
</body>
</html>`;

  return await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `You have ${unbidGames.length} game${unbidGames.length > 1 ? "s" : ""} to predict today!`,
    html,
  });
};
