import { jsonInstruction, runAgent } from "./gemini";

export async function findDestinations(input: PlannerInput): Promise<DestinationAgentResult> {
  const prompt = `You are a destination expert. A traveller wants to visit ${input.country} from ${input.startDate} to ${input.endDate} (${input.numberOfDays} days).

Traveller profile:
- Travel style: ${input.travelStyle || "any"}
- Interests: ${input.interests || "general sightseeing"}
- Budget level: ${input.budget || "mid-range"}
- Group type: ${input.groupType || "solo"}

Pick the ${Math.min(Math.max(Math.ceil(input.numberOfDays / 2), 2), 6)} best places to visit in ${input.country} for that exact period. Judge each place on what it is actually like during those dates: season, weather, crowds, local festivals or closures. Order them as a sensible travel route, not alphabetically. Do not suggest places that are a poor choice in that period.

${jsonInstruction(`{
  "season": "Which season those dates fall in, in ${input.country}",
  "weather": "Expected weather during those dates",
  "places": [
    {
      "name": "Place or city name",
      "region": "Region or nearest major city",
      "description": "What the place is and its highlights",
      "whyNow": "Why it is a good choice during these specific dates",
      "bestFor": ["interest 1", "interest 2"],
      "suggestedDays": 2,
      "topSights": ["sight 1", "sight 2", "sight 3"]
    }
  ],
  "notes": ["Practical note about travelling ${input.country} in this period"]
}`)}`;

  const result = await runAgent<DestinationAgentResult>("destination-agent", prompt);

  return {
    season: result.season || "",
    weather: result.weather || "",
    places: Array.isArray(result.places) ? result.places : [],
    notes: Array.isArray(result.notes) ? result.notes : [],
  };
}
