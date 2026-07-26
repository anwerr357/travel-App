import { cn } from "lib/utils";

interface PlaceCardProps {
  place: PlannerPlace;
  selected: boolean;
  onToggle: () => void;
}

const PlaceCard = ({ place, selected, onToggle }: PlaceCardProps) => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={selected}
    className={cn(
      "flex w-full flex-col rounded-2xl border bg-white p-5 text-left transition-colors cursor-pointer",
      selected ? "border-primary-500" : "border-light-400 opacity-60 hover:opacity-100"
    )}
  >
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="p-18-semibold text-dark-100">{place.name}</h3>
        <p className="text-sm text-gray-500">{place.region}</p>
      </div>
      <span
        className={cn(
          "mt-1 flex size-5 shrink-0 items-center justify-center rounded border",
          selected ? "border-primary-500 bg-primary-500" : "border-light-400"
        )}
      >
        {selected && <img src="/assets/icons/check.svg" alt="" className="size-3" />}
      </span>
    </div>

    <p className="mt-3 text-sm leading-relaxed text-dark-400">{place.description}</p>
    {place.whyNow && <p className="mt-2 text-sm text-primary-500">{place.whyNow}</p>}

    <div className="mt-3 flex flex-wrap gap-2">
      <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-500">
        {place.suggestedDays} day{place.suggestedDays > 1 ? "s" : ""}
      </span>
      {place.topSights?.map((sight) => (
        <span key={sight} className="rounded-full bg-light-200 px-3 py-1 text-xs text-gray-500">
          {sight}
        </span>
      ))}
    </div>
  </button>
);

export default PlaceCard;
