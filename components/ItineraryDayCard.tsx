import { normalizePrice } from "lib/utils";

interface ItineraryDayCardProps {
  day: number;
  location: string;
  date?: string;
  accommodation?: string;
  estimatedCost?: unknown;
  activities: Activity[];
  tips?: string[];
}

const ItineraryDayCard = ({
  day,
  location,
  date,
  accommodation,
  estimatedCost,
  activities,
  tips,
}: ItineraryDayCardProps) => (
  <article className="rounded-2xl border border-light-400 bg-white p-6">
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-light-400 pb-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-500">Day {day}</p>
        <h3 className="p-18-semibold text-dark-100">{location}</h3>
        {date && <p className="text-sm text-gray-500">{date}</p>}
      </div>
      {estimatedCost != null && (
        <span className="rounded-full bg-success-50 px-3 py-1 text-sm font-medium text-success-700">
          {normalizePrice(estimatedCost)}
        </span>
      )}
    </header>

    <ul className="mt-4 flex flex-col gap-4">
      {activities.map((activity, index) => (
        <li key={index} className="flex flex-col gap-1 sm:flex-row sm:gap-4">
          <span className="w-28 shrink-0 text-sm font-semibold text-dark-100">{activity.time}</span>
          <p className="flex-1 text-sm leading-relaxed text-dark-400">{activity.description}</p>
        </li>
      ))}
    </ul>

    {accommodation && (
      <p className="mt-4 border-t border-light-400 pt-4 text-sm text-gray-500">
        <span className="font-semibold text-dark-100">Stay: </span>
        {accommodation}
      </p>
    )}

    {tips && tips.length > 0 && (
      <ul className="mt-3 flex flex-col gap-1">
        {tips.map((tip, index) => (
          <li key={index} className="text-sm text-primary-500">
            {tip}
          </li>
        ))}
      </ul>
    )}
  </article>
);

export default ItineraryDayCard;
