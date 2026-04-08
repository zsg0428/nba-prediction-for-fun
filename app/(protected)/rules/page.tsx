import { PredictionRules } from "@/components/Predicitions/PredictionRules";
import { fetchAllRounds } from "@/actions/rounds";

export default async function RulePage() {
  const rounds = await fetchAllRounds();

  return (
    <div className="mx-0 my-0 flex items-center justify-center">
      <PredictionRules rounds={rounds} />
    </div>
  );
}
