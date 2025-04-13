import { refreshPredictions } from "@/actions/prediction";

import { prisma } from "@/lib/db";

export const seedRefreshPredictions = async () => {
  await refreshPredictions();
  console.log("✅ Predictions refreshed.");
};

seedRefreshPredictions()
  .catch((e) => {
    console.error("❌ Failed to refresh predictions:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
