"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarPlus, Menu, Phone } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { marketingNav, site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300 ease-[var(--ease-soft)]",
        scrolled
          ? "border-b border-border bg-surface/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <PageContainer className="flex h-[4.5rem] items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {marketingNav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative rounded-md px-3.5 py-2 text-body font-medium transition-colors",
                      active
                        ? "text-brand-800"
                        : "text-ink-700 hover:text-brand-700",
                    )}
                  >
                    {item.label}
                    {active ? (
                      <span
                        aria-hidden
                        className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-mint-400"
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={site.phoneHref}
            className="hidden items-center gap-2 rounded-md px-3 py-2 text-body font-medium text-ink-700 transition-colors hover:text-brand-700 xl:inline-flex"
          >
            <Phone className="size-4" aria-hidden />
            {site.phone}
          </a>
          <Button asChild size="lg" className="hidden sm:inline-flex">
            <Link href="/book">
              <CalendarPlus aria-hidden />
              Book appointment
            </Link>
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon-lg"
                className="lg:hidden"
                aria-label="Open menu"
              >
                <Menu aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(20rem,88vw)]">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <Logo withArabic={false} />
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile" className="px-4">
                <ul className="flex flex-col gap-1">
                  {marketingNav.map((item) => (
                    <li key={item.href}>
                      <SheetClose asChild>
                        <Link
                          href={item.href}
                          className="block rounded-lg px-3 py-3 text-subtitle font-medium text-ink-800 transition-colors hover:bg-mint-50 hover:text-brand-800"
                        >
                          {item.label}
                        </Link>
                      </SheetClose>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-auto flex flex-col gap-3 p-4">
                <SheetClose asChild>
                  <Button asChild size="xl">
                    <Link href="/book">Book appointment</Link>
                  </Button>
                </SheetClose>
                <Button asChild variant="outline" size="lg">
                  <a href={site.phoneHref}>
                    <Phone aria-hidden />
                    {site.phone}
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </PageContainer>
    </header>
  );
}
