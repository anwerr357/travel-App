import { jsonInstruction, runAgent } from "./gemini";

export async function estimateBudget(
  input: PlannerInput,
  places: PlannerPlace[]
): Promise<BudgetAgentResult> {
  const prompt = `You are a travel budget analyst. Estimate the cost of a ${input.numberOfDays}-day trip to ${input.country} from ${input.startDate} to ${input.endDate}, visiting: ${places.map((place) => place.name).join(", ")}.

Traveller profile:
- Budget level: ${input.budget || "mid-range"}
- Group type: ${input.groupType || "solo"}
- Travel style: ${input.travelStyle || "any"}

Use realistic ${input.country} prices for that season. Exclude international flights to the country. All amounts in USD for the whole group, for the whole trip. The breakdown amounts must add up to the total.

${jsonInstruction(`{
  "estimatedCost": 1200,
  "currency": "USD",
  "breakdown": [
    { "category": "Accommodation", "amount": 400, "note": "What this covers" },
    { "category": "Food", "amount": 250, "note": "What this covers" },
    { "category": "Local transport", "amount": 150, "note": "What this covers" },
    { "category": "Activities", "amount": 300, "note": "What this covers" },
    { "category": "Misc", "amount": 100, "note": "What this covers" }
  ],
  "savingTips": ["Concrete way to spend less on this trip"]
}`)}`;

  const result = await runAgent<BudgetAgentResult>("budget-agent", prompt);

  const breakdown = Array.isArray(result.breakdown) ? result.breakdown : [];

  return {
    estimatedCost: Number(result.estimatedCost) || breakdown.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    currency: result.currency || "USD",
    breakdown,
    savingTips: Array.isArray(result.savingTips) ? result.savingTips : [],
  };
}
