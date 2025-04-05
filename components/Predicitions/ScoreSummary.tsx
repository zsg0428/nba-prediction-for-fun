// components/predictions/ScoreSummary.tsx

interface ScoreSummaryProps {
  score: number;
}

export const ScoreSummary = ({ score }: ScoreSummaryProps) => {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold sm:text-xl">📊 当前得分</h2>
      <p className="text-sm text-muted-foreground sm:text-base">
        你的总分：{score}
      </p>
    </section>
  );
};
