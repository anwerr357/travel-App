import dayjs from "dayjs";

export const MAX_TRIP_DAYS = 15;

export function readPlannerInput(body: any): PlannerInput {
  const country = String(body?.country || "").trim();
  const startDate = String(body?.startDate || "").trim();
  const endDate = String(body?.endDate || "").trim();

  if (!country) throw new ValidationError("Country is required");
  if (!dayjs(startDate).isValid() || !dayjs(endDate).isValid()) {
    throw new ValidationError("A valid start date and end date are required");
  }

  const numberOfDays = dayjs(endDate).diff(dayjs(startDate), "day") + 1;

  if (numberOfDays < 1) throw new ValidationError("End date must be on or after the start date");
  if (numberOfDays > MAX_TRIP_DAYS) {
    throw new ValidationError(`The period must be ${MAX_TRIP_DAYS} days or fewer`);
  }

  return {
    country,
    startDate: dayjs(startDate).format("YYYY-MM-DD"),
    endDate: dayjs(endDate).format("YYYY-MM-DD"),
    numberOfDays,
    travelStyle: String(body?.travelStyle || ""),
    interests: String(body?.interests || ""),
    budget: String(body?.budget || ""),
    groupType: String(body?.groupType || ""),
  };
}

export class ValidationError extends Error {}

export function agentErrorResponse(e: any) {
  if (e instanceof ValidationError) {
    return Response.json({ error: true, message: e.message, type: "VALIDATION_ERROR" }, { status: 400 });
  }

  if (e.message?.includes("QUOTA_EXHAUSTED")) {
    return Response.json(
      {
        error: true,
        message: "Your Gemini API free tier quota has been completely used.",
        type: "QUOTA_EXHAUSTED",
        upgradeUrl: "https://ai.google.dev/pricing",
      },
      { status: 429 }
    );
  }

  if (e.status === 429 || e.message?.includes("quota")) {
    return Response.json(
      { error: true, message: "AI quota exceeded. Please try again in a minute.", type: "QUOTA_EXCEEDED" },
      { status: 429 }
    );
  }

  return Response.json(
    { error: true, message: e.message || "Unexpected error occurred", type: "UNKNOWN_ERROR" },
    { status: 500 }
  );
}
