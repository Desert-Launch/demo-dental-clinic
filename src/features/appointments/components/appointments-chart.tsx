"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";

import type { OverviewPoint } from "@/features/appointments";
import { pluralise } from "@/lib/utils";

/** Two weeks of the diary: the past week filled in, the week ahead outlined. */
export function AppointmentsChart({
  data,
  today,
}: {
  data: OverviewPoint[];
  today: string;
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -22 }}>
          <CartesianGrid
            vertical={false}
            stroke="var(--border)"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--ink-500)", fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={40}
            tick={{ fill: "var(--ink-500)", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: "var(--mint-50)" }}
            content={<ChartTooltip today={today} />}
          />
          <Bar dataKey="booked" radius={[6, 6, 0, 0]} maxBarSize={34}>
            {data.map((point) => (
              <Cell
                key={point.date}
                fill={point.date > today ? "var(--brand-300)" : "var(--brand-600)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface TooltipPayload {
  payload: OverviewPoint;
}

function ChartTooltip({
  active,
  payload,
  today,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  today: string;
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;

  const future = point.date > today;

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-[var(--shadow-md)]">
      <p className="text-small font-medium text-ink-900">
        {format(parseISO(point.date), "EEEE d MMM")}
      </p>
      <p data-numeric className="mt-1 text-small text-ink-600">
        {point.booked} {pluralise(point.booked, "appointment", "appointments")}{" "}
        {future ? "booked" : `· ${point.completed} completed`}
      </p>
    </div>
  );
}
