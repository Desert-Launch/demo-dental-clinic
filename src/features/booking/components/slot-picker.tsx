"use client";

import { useEffect, useMemo, useRef } from "react";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { CalendarX2, ChevronLeft, ChevronRight } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAvailableDays, useDaySlots, type DayOption } from "@/features/booking";
import { timeOfDay, timeOfDayLabels, type TimeOfDay } from "@/lib/scheduling";
import { cn, formatMinutesOfDay, pluralise } from "@/lib/utils";

const groups: TimeOfDay[] = ["morning", "afternoon", "evening"];

/**
 * The signature element: a scrolling day rail with live availability counts,
 * and a time grid that shows booked slots rather than hiding them, so a patient
 * can see the diary filling up.
 */
export function SlotPicker({
  serviceId,
  dentistId,
  date,
  startMinutes,
  onSelectDate,
  onSelectSlot,
}: {
  serviceId: string;
  dentistId: string;
  date: string | null;
  startMinutes: number | null;
  onSelectDate: (date: string) => void;
  onSelectSlot: (startMinutes: number | null) => void;
}) {
  const { data: days, isLoading: daysLoading } = useAvailableDays({ serviceId, dentistId });
  const { data: slots, isLoading: slotsLoading } = useDaySlots({
    serviceId,
    dentistId,
    date: date ?? undefined,
  });

  const railRef = useRef<HTMLDivElement>(null);

  // Land on the first day with room rather than an empty Sunday.
  useEffect(() => {
    if (date || !days) return;
    const firstOpen = days.find((day) => day.availableCount > 0) ?? days[0];
    if (firstOpen) onSelectDate(firstOpen.date);
  }, [date, days, onSelectDate]);

  const grouped = useMemo(() => {
    if (!slots) return null;
    return groups
      .map((group) => ({
        group,
        slots: slots.filter((slot) => timeOfDay(slot.startMinutes) === group),
      }))
      .filter((entry) => entry.slots.length > 0);
  }, [slots]);

  const freeCount = slots?.filter((slot) => slot.available).length ?? 0;
  const nextOpenDay = days?.find(
    (day) => day.availableCount > 0 && day.date > (date ?? ""),
  );

  function scrollRail(direction: -1 | 1) {
    railRef.current?.scrollBy({ left: direction * 280, behavior: "smooth" });
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-subtitle font-semibold text-ink-900">Pick a day</h3>
          <p className="mt-1 text-small text-ink-600">
            The next three weeks. Sundays we are closed.
          </p>
        </div>
        <div className="hidden gap-1.5 sm:flex">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => scrollRail(-1)}
            aria-label="Show earlier days"
          >
            <ChevronLeft aria-hidden />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => scrollRail(1)}
            aria-label="Show later days"
          >
            <ChevronRight aria-hidden />
          </Button>
        </div>
      </div>

      <div
        ref={railRef}
        className="-mx-1 mt-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-3 [scrollbar-width:thin]"
        role="group"
        aria-label="Available days"
      >
        {daysLoading
          ? Array.from({ length: 8 }, (_, index) => (
              <Skeleton key={index} className="h-[5.5rem] w-[4.5rem] shrink-0 rounded-lg" />
            ))
          : days?.map((day) => (
              <DayChip
                key={day.date}
                day={day}
                selected={day.date === date}
                onSelect={() => {
                  onSelectDate(day.date);
                  onSelectSlot(null);
                }}
              />
            ))}
      </div>

      <div className="mt-8">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-subtitle font-semibold text-ink-900">Pick a time</h3>
          {!slotsLoading && date ? (
            <p className="text-small text-ink-600" data-numeric>
              {freeCount} {pluralise(freeCount, "slot", "slots")} free
            </p>
          ) : null}
        </div>

        {slotsLoading ? (
          <div className="mt-5 grid gap-2 sm:grid-cols-4">
            {Array.from({ length: 12 }, (_, index) => (
              <Skeleton key={index} className="h-11 rounded-lg" />
            ))}
          </div>
        ) : freeCount === 0 ? (
          <EmptyState
            icon={CalendarX2}
            title="Nothing free that day"
            description={
              nextOpenDay
                ? `The diary is full. ${formatDayLabel(nextOpenDay.date)} has room.`
                : "The diary is full for the next three weeks. Call us and we will find a way."
            }
            action={
              nextOpenDay ? (
                <Button
                  type="button"
                  onClick={() => {
                    onSelectDate(nextOpenDay.date);
                    onSelectSlot(null);
                  }}
                >
                  Show {formatDayLabel(nextOpenDay.date)}
                </Button>
              ) : null
            }
            className="mt-5"
          />
        ) : (
          <div className="mt-5 space-y-6">
            {grouped?.map((entry) => (
              <fieldset key={entry.group}>
                <legend className="text-micro uppercase text-ink-500">
                  {timeOfDayLabels[entry.group]}
                </legend>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                  {entry.slots.map((slot) => {
                    const selected = slot.startMinutes === startMinutes;
                    return (
                      <button
                        key={slot.startMinutes}
                        type="button"
                        disabled={!slot.available}
                        aria-pressed={selected}
                        onClick={() => onSelectSlot(slot.startMinutes)}
                        className={cn(
                          "h-11 rounded-lg border text-body font-medium transition-all duration-200 ease-[var(--ease-soft)]",
                          selected
                            ? "border-brand-700 bg-brand-700 text-ink-0 shadow-[var(--shadow-sm)]"
                            : slot.available
                              ? "border-border bg-surface text-ink-800 hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-800"
                              : "cursor-not-allowed border-transparent bg-surface-muted text-ink-400 line-through",
                        )}
                      >
                        <span data-numeric>{formatMinutesOfDay(slot.startMinutes)}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
            <p className="text-small text-ink-500">
              Struck-through times are already taken. All times are Gulf Standard Time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DayChip({
  day,
  selected,
  onSelect,
}: {
  day: DayOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const closed = !day.open;
  const full = day.open && day.availableCount === 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={closed}
      aria-pressed={selected}
      className={cn(
        "flex w-[4.5rem] shrink-0 snap-start flex-col items-center gap-0.5 rounded-lg border px-2 py-3 transition-all duration-200 ease-[var(--ease-soft)]",
        selected
          ? "border-brand-700 bg-brand-700 text-ink-0 shadow-[var(--shadow-md)]"
          : closed
            ? "cursor-not-allowed border-dashed border-border bg-transparent text-ink-400"
            : "border-border bg-surface text-ink-800 hover:-translate-y-0.5 hover:border-brand-300",
      )}
    >
      <span
        className={cn(
          "text-micro uppercase",
          selected ? "text-mint-200" : closed ? "text-ink-400" : "text-ink-500",
        )}
      >
        {day.weekday}
      </span>
      <span data-numeric className="font-display text-title font-semibold">
        {day.dayOfMonth}
      </span>
      <span
        className={cn(
          "text-[0.6875rem]",
          selected
            ? "text-mint-200"
            : closed
              ? "text-ink-400"
              : full
                ? "text-sand-600"
                : "text-mint-600",
        )}
      >
        {closed ? "Closed" : full ? "Full" : `${day.availableCount} free`}
      </span>
    </button>
  );
}

function formatDayLabel(date: string): string {
  const parsed = parseISO(date);
  if (isToday(parsed)) return "today";
  if (isTomorrow(parsed)) return "tomorrow";
  return format(parsed, "EEEE d MMM");
}
