// components/predictions/PredictionRules.tsx

export const PredictionRules = () => {
  return (
    <section className="mt-8 text-sm text-muted-foreground sm:text-base">
      <h3 className="mb-2 text-base font-semibold sm:text-lg">📜 竞猜规则：</h3>
      <ul className="list-disc space-y-1 pl-4 sm:pl-6">
        <li>第一轮猜对：1分</li>
        <li>第二轮猜对：2分</li>
        <li>第三轮猜对：3分</li>
        <li>总决赛猜对：5分</li>
        <li>比赛开始后无法再竞猜</li>
      </ul>
    </section>
  );
};
