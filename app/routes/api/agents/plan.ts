import { ID } from "appwrite";
import type { ActionFunctionArgs } from "react-router";
import { appwriteConfig, tablesDB } from "~/appwrite";
import { buildItinerary } from "~/lib/agents/itinerary-agent";
import { estimateBudget } from "~/lib/agents/budget-agent";
import { agentErrorResponse, readPlannerInput, ValidationError } from "~/lib/agents/planner-input";
import { fetchTripImages } from "~/lib/unsplash";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const body = await request.json();
    const input = readPlannerInput(body);

    const places: PlannerPlace[] = Array.isArray(body?.places) ? body.places : [];
    const season = String(body?.season || "");
    const weather = String(body?.weather || "");
    const userId = String(body?.userId || "");

    if (places.length === 0) throw new ValidationError("At least one place is required");
    if (!userId) throw new ValidationError("You must be signed in to save a plan");

    const [itinerary, budget, imageUrls] = await Promise.all([
      buildItinerary(input, places, season),
      estimateBudget(input, places),
      fetchTripImages(`${input.country} ${places[0]?.name || ""} travel`),
    ]);

    const tripDetail = {
      destination: input.country,
      country: input.country,
      duration: input.numberOfDays,
      startDate: input.startDate,
      endDate: input.endDate,
      travelStyle: input.travelStyle,
      budget: input.budget,
      groupType: input.groupType,
      interests: input.interests,
      overview: itinerary.overview,
      places,
      itinerary: itinerary.itinerary,
      tips: [
        `Season: ${season}`,
        `Weather: ${weather}`,
        ...itinerary.tips,
        ...budget.savingTips,
      ],
      budgetBreakdown: budget.breakdown,
      estimatedCost: budget.estimatedCost,
      currency: budget.currency,
      generatedBy: "planner-agents",
      agents: ["destination-agent", "itinerary-agent", "budget-agent"],
    };

    const result = await tablesDB.createRow({
      databaseId: appwriteConfig.databaseID,
      tableId: appwriteConfig.tripTableId,
      rowId: ID.unique(),
      data: {
        tripDetail: JSON.stringify(tripDetail),
        createdAt: new Date().toISOString(),
        imageUrls,
        userId,
      },
    });

    return { id: result.$id, estimatedCost: budget.estimatedCost };
  } catch (e: any) {
    console.error("planner agents failed:", e);
    return agentErrorResponse(e);
  }
};
