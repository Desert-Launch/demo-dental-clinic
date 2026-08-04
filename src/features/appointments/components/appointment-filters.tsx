"use client";

import { useEffect, useState } from "react";
import { addDays, endOfDay, format, parseISO, startOfDay, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { CalendarRange, Check, ListFilter, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { emptyAppointmentFilter, type AppointmentTableFilter } from "@/features/appointments";
import { useDentists } from "@/features/dentists";
import { cn } from "@/lib/utils";
import { appointmentStatusLabels, appointmentStatuses } from "@/types";

const presets = [
  { value: "all", label: "Any date" },
  { value: "today", label: "Today" },
  { value: "next7", label: "Next 7 days" },
  { value: "past30", label: "Last 30 days" },
] as const;

type PresetValue = (typeof presets)[number]["value"];

function presetRange(value: PresetValue): { from: string | null; to: string | null } {
  const now = new Date();
  switch (value) {
    case "today":
      return { from: startOfDay(now).toISOString(), to: endOfDay(now).toISOString() };
    case "next7":
      return {
        from: startOfDay(now).toISOString(),
        to: endOfDay(addDays(now, 7)).toISOString(),
      };
    case "past30":
      return {
        from: startOfDay(subDays(now, 30)).toISOString(),
        to: endOfDay(now).toISOString(),
      };
    default:
      return { from: null, to: null };
  }
}

export function AppointmentFilters({
  filter,
  onChange,
  resultCount,
}: {
  filter: AppointmentTableFilter;
  onChange: (next: AppointmentTableFilter) => void;
  resultCount: number;
}) {
  const { data: dentists } = useDentists();
  const [searchDraft, setSearchDraft] = useState(filter.search);
  const [preset, setPreset] = useState<PresetValue>("all");

  // Typing shouldn't re-query the store on every keystroke.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchDraft !== filter.search) onChange({ ...filter, search: searchDraft });
    }, 220);
    return () => window.clearTimeout(timer);
  }, [filter, onChange, searchDraft]);

  const range: DateRange | undefined = filter.from
    ? { from: parseISO(filter.from), to: filter.to ? parseISO(filter.to) : undefined }
    : undefined;

  const isFiltered =
    filter.search !== "" ||
    filter.statuses.length > 0 ||
    filter.dentistId !== "all" ||
    filter.from !== null;

  function clearAll() {
    setSearchDraft("");
    setPreset("all");
    onChange(emptyAppointmentFilter);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400"
            aria-hidden
          />
          <Input
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="Search patient, reference or phone"
            className="pl-9"
            aria-label="Search appointments"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ListFilter aria-hidden />
              Status
              {filter.statuses.length > 0 ? (
                <Badge className="ml-1 bg-brand-700 text-ink-0">
                  {filter.statuses.length}
                </Badge>
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuLabel>Show statuses</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {appointmentStatuses.map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={filter.statuses.includes(status)}
                onCheckedChange={(checked) =>
                  onChange({
                    ...filter,
                    statuses: checked
                      ? [...filter.statuses, status]
                      : filter.statuses.filter((item) => item !== status),
                  })
                }
                onSelect={(event) => event.preventDefault()}
              >
                {appointmentStatusLabels[status]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Select
          value={filter.dentistId}
          onValueChange={(dentistId) => onChange({ ...filter, dentistId })}
        >
          <SelectTrigger className="w-48" aria-label="Filter by dentist">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All dentists</SelectItem>
            {dentists?.map((dentist) => (
              <SelectItem key={dentist.id} value={dentist.id}>
                {dentist.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={preset}
          onValueChange={(value: PresetValue) => {
            setPreset(value);
            onChange({ ...filter, ...presetRange(value) });
          }}
        >
          <SelectTrigger className="w-40" aria-label="Filter by date">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {presets.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn(range && "border-brand-300")}>
              <CalendarRange aria-hidden />
              {range?.from
                ? `${format(range.from, "d MMM")}${range.to ? ` – ${format(range.to, "d MMM")}` : ""}`
                : "Custom range"}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto p-0">
            <Calendar
              mode="range"
              numberOfMonths={1}
              defaultMonth={range?.from}
              selected={range}
              onSelect={(next) => {
                setPreset("all");
                onChange({
                  ...filter,
                  from: next?.from ? startOfDay(next.from).toISOString() : null,
                  to: next?.to ? endOfDay(next.to).toISOString() : null,
                });
              }}
            />
          </PopoverContent>
        </Popover>

        {isFiltered ? (
          <Button variant="ghost" onClick={clearAll}>
            <X aria-hidden />
            Clear
          </Button>
        ) : null}
      </div>

      <p className="text-small text-ink-600" data-numeric>
        {resultCount} {resultCount === 1 ? "appointment" : "appointments"}
        {isFiltered ? " match these filters" : " in the diary"}
        {filter.statuses.length > 0 ? (
          <span className="ml-2 inline-flex items-center gap-1 text-brand-700">
            <Check className="size-3.5" aria-hidden />
            {filter.statuses.map((status) => appointmentStatusLabels[status]).join(", ")}
          </span>
        ) : null}
      </p>
    </div>
  );
}
