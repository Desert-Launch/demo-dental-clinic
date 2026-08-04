import type { ReactNode } from "react";

import { PageContainer } from "@/components/layout/page-container";

export function MarketingPageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <header className="wash-brand relative overflow-hidden border-b border-border">
      <PageContainer className="py-16 sm:py-20">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-display-2 text-ink-950">{title}</h1>
        {lead ? <p className="mt-5 max-w-2xl text-lead text-ink-700">{lead}</p> : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </PageContainer>
    </header>
  );
}
