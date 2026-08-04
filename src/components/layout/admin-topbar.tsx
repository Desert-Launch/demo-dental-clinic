"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Menu } from "lucide-react";

import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getClinicStatus } from "@/lib/clinic-status";
import { useSessionStore } from "@/lib/state/session-store";
import { cn } from "@/lib/utils";

export function AdminTopbar() {
  const navOpen = useSessionStore((state) => state.navOpen);
  const setNavOpen = useSessionStore((state) => state.setNavOpen);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const status = now ? getClinicStatus(now) : null;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
            <Menu aria-hidden />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 border-0 bg-sidebar p-0">
          <SheetTitle className="sr-only">Dashboard menu</SheetTitle>
          <AdminSidebar onNavigate={() => setNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <p className="text-body font-medium text-ink-800" data-numeric>
        {now ? format(now, "EEEE d MMMM") : "—"}
      </p>

      <p
        className={cn(
          "ml-auto hidden items-center gap-2 rounded-full border border-border px-3 py-1.5 text-small text-ink-600 sm:inline-flex",
          !status && "opacity-0",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "size-2 rounded-full",
            status?.open ? "bg-success-500" : "bg-sand-500",
          )}
        />
        {status?.label ?? "Checking hours"}
      </p>
    </header>
  );
}
