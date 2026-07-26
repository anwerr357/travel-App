import { jsonInstruction, runAgent } from "./gemini";

export async function buildItinerary(
  input: PlannerInput,
  places: PlannerPlace[],
  season: string
): Promise<ItineraryAgentResult> {
  const placeList = places
    .map((place) => `- ${place.name} (${place.region}) — good for ${place.bestFor?.join(", ") || "sightseeing"}, suggested ${place.suggestedDays} day(s)`)
    .join("\n");

  const prompt = `You are an itinerary planner. Build a ${input.numberOfDays}-day plan for ${input.country}, starting ${input.startDate} and ending ${input.endDate}. The season is: ${season}.

Only use these places, chosen by the destination expert:
${placeList}

Traveller profile:
- Travel style: ${input.travelStyle || "any"}
- Interests: ${input.interests || "general sightseeing"}
- Budget level: ${input.budget || "mid-range"}
- Group type: ${input.groupType || "solo"}

Rules:
- Exactly ${input.numberOfDays} days, numbered 1 to ${input.numberOfDays}, each with its real calendar date starting at ${input.startDate}.
- Group consecutive days in the same place; put travel between places in the morning or evening of the day it happens.
- Name real venues, restaurants and sights. No generic filler like "explore the city".
- Keep each day realistic: allow for travel time and rest.

${jsonInstruction(`{
  "overview": "Two or three sentences describing the trip",
  "itinerary": [
    {
      "day": 1,
      "date": "${input.startDate}",
      "location": "Place name",
      "morning": "Specific morning activity with venue names",
      "afternoon": "Specific afternoon activity with venue names",
      "evening": "Specific evening activity with venue names",
      "accommodation": "Suggested area or hotel type to stay in",
      "estimatedCost": 120,
      "tips": ["Practical tip for this day"]
    }
  ],
  "tips": ["General tip for the whole trip"]
}`)}`;

  const result = await runAgent<ItineraryAgentResult>("itinerary-agent", prompt);

  return {
    overview: result.overview || "",
    itinerary: Array.isArray(result.itinerary) ? result.itinerary : [],
    tips: Array.isArray(result.tips) ? result.tips : [],
  };
}
