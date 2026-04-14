import { prisma } from "../lib/db";

async function main() {
  const { count } = await prisma.user.updateMany({
    where: { emailReminders: false },
    data: { emailReminders: true },
  });
  console.log(`✅ Enabled email reminders for ${count} users.`);
  const total = await prisma.user.count();
  console.log(`   Total users: ${total}`);
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
