"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarRange,
  ChevronsUpDown,
  ExternalLink,
  LayoutDashboard,
  Users,
  type LucideIcon,
} from "lucide-react";

import { LogoMark } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ResetDemoButton } from "@/features/demo";
import { useDentists } from "@/features/dentists";
import { useSessionStore } from "@/lib/state/session-store";
import { cn, initials } from "@/lib/utils";

interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Overview would otherwise match every nested admin route. */
  exact?: boolean;
}

export const adminNav: AdminNavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/appointments", label: "Appointments", icon: CalendarRange },
  { href: "/admin/patients", label: "Patients", icon: Users },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-[4.5rem] items-center gap-3 px-5">
        <LogoMark className="size-8" />
        <div className="leading-tight">
          <p className="font-display text-body font-semibold text-ink-0">Nile Dental</p>
          <p className="text-small text-brand-300">Clinic dashboard</p>
        </div>
      </div>

      <nav aria-label="Dashboard" className="mt-4 flex-1 px-3">
        <ul className="space-y-1">
          {adminNav.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-body font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-ink-0"
                      : "text-brand-200 hover:bg-sidebar-accent/60 hover:text-ink-0",
                  )}
                >
                  <item.icon className="size-4.5" aria-hidden />
                  {item.label}
                  {active ? (
                    <span
                      aria-hidden
                      className="ml-auto size-1.5 rounded-full bg-mint-300"
                    />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-1 border-t border-sidebar-border p-3">
        <StaffSwitcher />
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-full justify-start text-brand-200 hover:bg-sidebar-accent hover:text-ink-0"
        >
          <Link href="/" onClick={onNavigate}>
            <ExternalLink aria-hidden />
            View the public site
          </Link>
        </Button>
        <ResetDemoButton />
      </div>
    </div>
  );
}

function StaffSwitcher() {
  const { data: dentists, isLoading } = useDentists();
  const staffId = useSessionStore((state) => state.staffId);
  const setStaffId = useSessionStore((state) => state.setStaffId);
  const current = dentists?.find((dentist) => dentist.id === staffId) ?? dentists?.[0];

  if (isLoading || !current) {
    return <Skeleton className="h-14 w-full rounded-lg bg-brand-900" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-sidebar-accent"
        >
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mint-300 text-small font-semibold text-brand-950"
          >
            {initials(current.name.replace("Dr. ", ""))}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-body font-medium text-ink-0">
              {current.name}
            </span>
            <span className="block truncate text-small text-brand-300">
              Signed in (demo)
            </span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-brand-300" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel>Switch clinician</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {dentists?.map((dentist) => (
          <DropdownMenuItem key={dentist.id} onSelect={() => setStaffId(dentist.id)}>
            <span className="flex size-6 items-center justify-center rounded-full bg-mint-100 text-[0.625rem] font-semibold text-brand-800">
              {initials(dentist.name.replace("Dr. ", ""))}
            </span>
            <span className="truncate">{dentist.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
