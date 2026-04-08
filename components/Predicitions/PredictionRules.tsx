type Round = {
  name: string;
  point: number;
};

export const PredictionRules = ({ rounds }: { rounds: Round[] }) => {
  return (
    <section className="mt-8 text-sm text-muted-foreground sm:text-base">
      <h3 className="mb-2 text-base font-semibold sm:text-lg">📜 竞猜规则：</h3>
      <ul className="list-disc space-y-1 pl-4 sm:pl-6">
        {rounds.map((round) => (
          <li key={round.name}>猜对 {round.name}：{round.point}分</li>
        ))}
        <li>比赛开始后无法再竞猜</li>
      </ul>
    </section>
  );
};
