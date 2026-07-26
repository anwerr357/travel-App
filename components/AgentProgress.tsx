import { cn } from "lib/utils";

export type AgentState = "idle" | "running" | "done";

export interface AgentStep {
  name: string;
  detail: string;
  state: AgentState;
}

const icons: Record<AgentState, string> = {
  idle: "/assets/icons/magic-star.svg",
  running: "/assets/icons/loader.svg",
  done: "/assets/icons/check.svg",
};

const AgentProgress = ({ steps }: { steps: AgentStep[] }) => (
  <ul className="flex flex-col gap-3 md:flex-row">
    {steps.map((step) => (
      <li
        key={step.name}
        className={cn(
          "flex flex-1 items-center gap-3 rounded-2xl border bg-white p-4",
          step.state === "running" && "border-primary-500",
          step.state === "done" && "border-success-700",
          step.state === "idle" && "border-light-400 opacity-60"
        )}
      >
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full",
            step.state === "done" ? "bg-success-50" : "bg-light-200"
          )}
        >
          <img
            src={icons[step.state]}
            alt=""
            className={cn("size-4", { "animate-spin": step.state === "running" })}
          />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-dark-100">{step.name}</h3>
          <p className="text-xs text-gray-500">{step.detail}</p>
        </div>
      </li>
    ))}
  </ul>
);

export default AgentProgress;
