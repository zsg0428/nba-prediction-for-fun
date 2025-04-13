// components/predictions/PredictionRules.tsx

export const PredictionRules = () => {
  return (
    <section className="mt-8 text-sm text-muted-foreground sm:text-base">
      <h3 className="mb-2 text-base font-semibold sm:text-lg">📜 竞猜规则：</h3>
      <ul className="list-disc space-y-1 pl-4 sm:pl-6">
        <li>猜对 Play In：1分</li>
        <li>猜对 First Round：1.5分</li>
        <li>猜对 Conference Semifinals：2分</li>
        <li>猜对 Conference Finals：3分</li>
        <li>猜对 Finals：5分</li>
        <li>比赛开始后无法再竞猜</li>
      </ul>
    </section>
  );
};
