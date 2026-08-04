import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

/** The one horizontal rhythm every page uses. */
export function PageContainer({
  children,
  className,
  as: Tag = "div",
  size = "default",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  size?: "default" | "wide" | "narrow";
}) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-5 sm:px-8",
        size === "narrow" && "max-w-3xl",
        size === "default" && "max-w-[76rem]",
        size === "wide" && "max-w-[90rem]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
