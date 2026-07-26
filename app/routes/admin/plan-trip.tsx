import { useState } from "react";
import { useNavigate } from "react-router";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { ComboBoxComponent } from "@syncfusion/ej2-react-dropdowns";
import dayjs from "dayjs";
import { AgentProgress, Header, PlaceCard } from "~/components";
import type { AgentStep } from "../../../components/AgentProgress";
import type { Route } from "./+types/plan-trip";
import { budgetOptions, groupTypes, interests, travelStyles } from "~/constants";
import { loadCountries } from "~/lib/countries";
import { MAX_TRIP_DAYS } from "~/lib/agents/planner-input";
import { cn } from "~/lib/utils";
import { account } from "~/appwrite";

export const loader = async () => loadCountries();

type Stage = "form" | "finding" | "review" | "planning";

const comboFields = { text: "text", value: "value" };
const toItems = (values: string[]) => values.map((value) => ({ text: value, value }));

const PlanTrip = ({ loaderData }: Route.ComponentProps) => {
  const countries = loaderData as Country[];
  const navigate = useNavigate();

  const [form, setForm] = useState({
    country: "",
    startDate: dayjs().add(7, "day").format("YYYY-MM-DD"),
    endDate: dayjs().add(11, "day").format("YYYY-MM-DD"),
    travelStyle: "",
    interests: "",
    budget: "",
    groupType: "",
  });

  const [stage, setStage] = useState<Stage>("form");
  const [error, setError] = useState<string | null>(null);
  const [destinations, setDestinations] = useState<DestinationAgentResult | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const numberOfDays = dayjs(form.endDate).diff(dayjs(form.startDate), "day") + 1;
  const busy = stage === "finding" || stage === "planning";

  const countryItems = countries.map((country) => ({ text: country.name, value: country.value }));

  const update = (key: keyof typeof form, value: string) => setForm({ ...form, [key]: value });

  const post = async (url: string, body: object) => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok || result?.error) {
      throw new Error(result?.message || `Request failed with status ${response.status}`);
    }

    return result;
  };

  const findPlaces = async () => {
    setError(null);

    if (!form.country) return setError("Pick a country first");
    if (numberOfDays < 1) return setError("End date must be on or after the start date");
    if (numberOfDays > MAX_TRIP_DAYS) return setError(`Keep the period to ${MAX_TRIP_DAYS} days or fewer`);

    setStage("finding");
    setDestinations(null);

    try {
      const result: DestinationAgentResult = await post("/api/agents/destinations", form);
      setDestinations(result);
      setSelected(result.places.map((place) => place.name));
      setStage("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "The destination agent failed");
      setStage("form");
    }
  };

  const buildPlan = async () => {
    setError(null);

    const places = destinations?.places.filter((place) => selected.includes(place.name)) || [];
    if (places.length === 0) return setError("Keep at least one place in the plan");

    setStage("planning");

    try {
      const user = await account.get();
      const result = await post("/api/agents/plan", {
        ...form,
        places,
        season: destinations?.season,
        weather: destinations?.weather,
        userId: user.$id,
      });
      navigate(`/trips/${result.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The planner agents failed");
      setStage("review");
    }
  };

  const togglePlace = (name: string) =>
    setSelected(selected.includes(name) ? selected.filter((item) => item !== name) : [...selected, name]);

  const steps: AgentStep[] = [
    {
      name: "Destination agent",
      detail: "Best places for your dates",
      state: destinations ? "done" : stage === "finding" ? "running" : "idle",
    },
    {
      name: "Itinerary agent",
      detail: "Day-by-day schedule",
      state: stage === "planning" ? "running" : "idle",
    },
    {
      name: "Budget agent",
      detail: "Cost and breakdown",
      state: stage === "planning" ? "running" : "idle",
    },
  ];

  return (
    <main className="flex flex-col gap-8 pb-20 wrapper">
      <Header
        title="Plan a Trip"
        description="Give a country and a period — the agents pick the best places and build the plan"
      />

      <AgentProgress steps={steps} />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-medium text-red-800">Something went wrong</h3>
          <p className="mt-1 text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <section className="flex flex-col gap-5 rounded-2xl border border-light-400 bg-white p-6 lg:sticky lg:top-4 lg:self-start">
          <div>
            <label htmlFor="planner-country">Country</label>
            <ComboBoxComponent
              id="planner-country"
              dataSource={countryItems}
              fields={comboFields}
              placeholder="Select a country"
              className="combo-box"
              allowFiltering
              change={(e: any) => e?.value && update("country", e.value)}
              filtering={(e) => {
                const query = e.text.toLowerCase();
                e.updateData(countryItems.filter((item) => item.text.toLowerCase().includes(query)));
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="startDate">Start date</label>
              <input
                id="startDate"
                type="date"
                className="form-input"
                value={form.startDate}
                onChange={(e) => update("startDate", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="endDate">End date</label>
              <input
                id="endDate"
                type="date"
                className="form-input"
                value={form.endDate}
                min={form.startDate}
                onChange={(e) => update("endDate", e.target.value)}
              />
            </div>
          </div>

          {numberOfDays > 0 && (
            <p className="text-sm text-gray-500">
              {numberOfDays} day{numberOfDays > 1 ? "s" : ""} — {dayjs(form.startDate).format("MMM DD")} to{" "}
              {dayjs(form.endDate).format("MMM DD, YYYY")}
            </p>
          )}

          <div>
            <label htmlFor="planner-groupType">Group Type</label>
            <ComboBoxComponent
              id="planner-groupType"
              dataSource={toItems(groupTypes)}
              fields={comboFields}
              placeholder="Who is travelling?"
              className="combo-box"
              change={(e: any) => e?.value && update("groupType", e.value)}
            />
          </div>

          <div>
            <label htmlFor="planner-travelStyle">Travel Style</label>
            <ComboBoxComponent
              id="planner-travelStyle"
              dataSource={toItems(travelStyles)}
              fields={comboFields}
              placeholder="How do you like to travel?"
              className="combo-box"
              change={(e: any) => e?.value && update("travelStyle", e.value)}
            />
          </div>

          <div>
            <label htmlFor="planner-interests">Interest</label>
            <ComboBoxComponent
              id="planner-interests"
              dataSource={toItems(interests)}
              fields={comboFields}
              placeholder="What do you want to see?"
              className="combo-box"
              change={(e: any) => e?.value && update("interests", e.value)}
            />
          </div>

          <div>
            <label htmlFor="planner-budget">Budget</label>
            <ComboBoxComponent
              id="planner-budget"
              dataSource={toItems(budgetOptions)}
              fields={comboFields}
              placeholder="Select a budget level"
              className="combo-box"
              change={(e: any) => e?.value && update("budget", e.value)}
            />
          </div>

          <ButtonComponent
            type="button"
            className="button-class !h-12 !w-full"
            disabled={busy}
            onClick={findPlaces}
          >
            <img
              src={`/assets/icons/${busy ? "loader.svg" : "magic-star.svg"}`}
              className={cn("size-5", { "animate-spin": busy })}
            />
            <span className="p-16-semibold text-white">
              {stage === "finding" ? "Finding places..." : destinations ? "Find places again" : "Find the best places"}
            </span>
          </ButtonComponent>
        </section>

        <section className="flex flex-col gap-5 lg:col-span-2">
          {!destinations && !busy && (
            <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-light-400 p-10 text-center">
              <img src="/assets/icons/destination.svg" alt="" className="size-8 opacity-40" />
              <h2 className="mt-4 p-18-semibold text-dark-100">No places yet</h2>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                Choose a country and your travel dates, then let the destination agent find the best places for that
                exact period.
              </p>
            </div>
          )}

          {stage === "finding" && (
            <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-2xl border border-light-400 bg-white p-10 text-center">
              <img src="/assets/icons/loader.svg" alt="" className="size-8 animate-spin" />
              <p className="mt-4 text-sm text-gray-500">
                Checking season, weather and crowds for {form.country}...
              </p>
            </div>
          )}

          {destinations && (
            <>
              <div className="flex flex-col gap-1">
                <h2 className="p-24-semibold text-dark-100">Best places for your dates</h2>
                <p className="text-sm text-gray-500">
                  {[destinations.season, destinations.weather].filter(Boolean).join(" — ")}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {destinations.places.map((place) => (
                  <PlaceCard
                    key={place.name}
                    place={place}
                    selected={selected.includes(place.name)}
                    onToggle={() => togglePlace(place.name)}
                  />
                ))}
              </div>

              {destinations.notes.length > 0 && (
                <ul className="flex flex-col gap-2 rounded-2xl bg-light-200 p-5">
                  {destinations.notes.map((note) => (
                    <li key={note} className="text-sm text-dark-400">
                      {note}
                    </li>
                  ))}
                </ul>
              )}

              <ButtonComponent
                type="button"
                className="button-class !h-12 !w-full"
                disabled={busy}
                onClick={buildPlan}
              >
                <img
                  src={`/assets/icons/${stage === "planning" ? "loader.svg" : "itinerary-button.svg"}`}
                  className={cn("size-5", { "animate-spin": stage === "planning" })}
                />
                <span className="p-16-semibold text-white">
                  {stage === "planning"
                    ? "Building your plan..."
                    : `Build my ${numberOfDays}-day plan (${selected.length} place${selected.length === 1 ? "" : "s"})`}
                </span>
              </ButtonComponent>
            </>
          )}
        </section>
      </div>
    </main>
  );
};

export default PlanTrip;
