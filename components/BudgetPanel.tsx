import { normalizePrice } from "lib/utils";

interface BudgetPanelProps {
  total: unknown;
  duration?: number;
  breakdown?: BudgetLine[];
}

const BudgetPanel = ({ total, duration, breakdown }: BudgetPanelProps) => {
  const lines = (breakdown || []).filter((line) => line && typeof line.amount === "number");

  return (
    <section className="rounded-2xl border border-light-400 bg-white p-6">
      <h3 className="p-18-semibold text-dark-100">Estimated cost</h3>
      <p className="mt-1 text-3xl font-semibold text-dark-100">{normalizePrice(total, duration)}</p>

      {lines.length > 0 && (
        <ul className="mt-4 flex flex-col gap-3 border-t border-light-400 pt-4">
          {lines.map((line, index) => (
            <li key={index} className="flex flex-col gap-0.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-dark-100">{line.category}</span>
                <span className="text-sm text-dark-400">{normalizePrice(line.amount)}</span>
              </div>
              {line.note && <p className="text-xs text-gray-500">{line.note}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default BudgetPanel;
