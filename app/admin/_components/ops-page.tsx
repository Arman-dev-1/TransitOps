"use client";

import { InternalNav } from "./internal-nav";

type OpsPageProps = {
  kicker: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

export function OpsPage({ kicker, title, subtitle, action, children }: OpsPageProps) {
  return (
    <main className="live-dashboard">
      <InternalNav />
      <section className="live-heading">
        <div>
          <p>{kicker}</p>
          <h1>{title}</h1>
          {subtitle && <span>{subtitle}</span>}
        </div>
        {action}
      </section>
      {children}
    </main>
  );
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ").toLowerCase();
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  const alert = normalized === "OPEN" || normalized === "IN_SHOP" || normalized === "SUSPENDED";
  return <em className={alert ? "alert-status" : undefined}>{formatStatus(status)}</em>;
}

export { formatStatus, formatDate };
