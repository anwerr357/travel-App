import type { ActionFunctionArgs } from "react-router";
import { findDestinations } from "~/lib/agents/destination-agent";
import { agentErrorResponse, readPlannerInput } from "~/lib/agents/planner-input";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const input = readPlannerInput(await request.json());
    const result = await findDestinations(input);

    if (result.places.length === 0) {
      return Response.json(
        { error: true, message: "The destination agent did not return any places. Try again." },
        { status: 502 }
      );
    }

    return { agent: "destination-agent", ...result };
  } catch (e: any) {
    console.error("destination-agent failed:", e);
    return agentErrorResponse(e);
  }
};
